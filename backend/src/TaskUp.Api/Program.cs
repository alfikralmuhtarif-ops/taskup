using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TaskUp.Api.Filters;
using TaskUp.Api.Middleware;
using TaskUp.Api.Services;
using System.Net;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.HttpOverrides;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Admin;
using TaskUp.Application.Ai;
using TaskUp.Application.Chat;
using TaskUp.Application.Files;
using TaskUp.Application.Identity;
using TaskUp.Application.Invites;
using TaskUp.Application.Notes;
using TaskUp.Application.Notifications;
using TaskUp.Application.People;
using TaskUp.Application.Projects;
using TaskUp.Application.RealTime;
using TaskUp.Application.Tasks;
using TaskUp.Api.BackgroundJobs;
using TaskUp.Infrastructure.Admin;
using TaskUp.Infrastructure.Ai;
using TaskUp.Infrastructure.Authorization;
using TaskUp.Infrastructure.Chat;
using TaskUp.Infrastructure.Files;
using TaskUp.Infrastructure.Identity;
using TaskUp.Infrastructure.Invites;
using TaskUp.Infrastructure.Notes;
using TaskUp.Infrastructure.Notifications;
using TaskUp.Infrastructure.People;
using TaskUp.Infrastructure.Persistence;
using TaskUp.Infrastructure.Projects;
using TaskUp.Infrastructure.RealTime;
using TaskUp.Infrastructure.Search;
using TaskUp.Infrastructure.Security;
using TaskUp.Infrastructure.Tasks;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<TaskUpDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()!;

builder.Services.Configure<OtpDevOptions>(builder.Configuration.GetSection(OtpDevOptions.SectionName));

builder.Services.Configure<EncryptionOptions>(builder.Configuration.GetSection(EncryptionOptions.SectionName));
builder.Services.AddSingleton<IFieldEncryptionService, AesGcmFieldEncryptionService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IIdentityService, IdentityService>();
// SMS delivery. Authentica (authentica.sa) is used when an API key is configured;
// without one the logging stand-in stays, so the whole auth flow still runs locally
// without credentials or spending real SMS credits. Deciding here rather than inside
// the sender means nothing silently no-ops in production: once a key is present, real
// delivery is the only behaviour.
builder.Services.Configure<AuthenticaSmsOptions>(
    builder.Configuration.GetSection(AuthenticaSmsOptions.SectionName));

var authenticaOptions = builder.Configuration
    .GetSection(AuthenticaSmsOptions.SectionName).Get<AuthenticaSmsOptions>() ?? new AuthenticaSmsOptions();

if (!string.IsNullOrWhiteSpace(authenticaOptions.ApiKey))
{
    builder.Services.AddHttpClient<ISmsSender, AuthenticaSmsSender>(client =>
    {
        client.BaseAddress = new Uri(authenticaOptions.BaseUrl);
        client.Timeout = TimeSpan.FromSeconds(authenticaOptions.TimeoutSeconds);
        client.DefaultRequestHeaders.Add("X-Authorization", authenticaOptions.ApiKey);
        client.DefaultRequestHeaders.Add("Accept", "application/json");
    });
}
else
{
    builder.Services.AddScoped<ISmsSender, LoggingSmsSender>();
}

builder.Services.AddScoped<ITaskAuthorizationService, TaskAuthorizationService>();
builder.Services.AddScoped<IProjectAuthorizationService, ProjectAuthorizationService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IProjectService, ProjectService>();

builder.Services.Configure<FileStorageOptions>(builder.Configuration.GetSection(FileStorageOptions.SectionName));
builder.Services.AddSingleton(sp => sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<FileStorageOptions>>().Value);
builder.Services.AddScoped<IFileStorage, LocalFileStorage>();
builder.Services.AddScoped<IFilesService, FilesService>();

builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IPeopleService, PeopleService>();
builder.Services.AddScoped<IInviteService, InviteService>();

builder.Services.AddScoped<INoteAuthorizationService, NoteAuthorizationService>();
builder.Services.AddScoped<INoteService, NoteService>();
builder.Services.AddScoped<NoteRlsActionFilter>();

builder.Services.AddScoped<IPushSender, LoggingPushSender>();
builder.Services.AddScoped<INotificationPublisher, NotificationPublisher>();
builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddScoped<ISearchProvider, PostgresSearchProvider>();

builder.Services.AddScoped<IAiTaskInsightProvider, StubAiTaskInsightProvider>();
builder.Services.AddScoped<IAiTrialPolicy, TrialAiPolicy>();
builder.Services.AddScoped<IAiService, AiService>();

builder.Services.AddSignalR();
builder.Services.AddScoped<IRealTimeNotifier, SignalRNotifier>();

builder.Services.AddHostedService<OverdueTaskSweepJob>();
builder.Services.AddHostedService<NotesTrashPurgeJob>();

builder.Services.Configure<AdminBootstrapOptions>(builder.Configuration.GetSection(AdminBootstrapOptions.SectionName));
builder.Services.AddSingleton(sp => sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<AdminBootstrapOptions>>().Value);
builder.Services.AddScoped<IAdminService, AdminService>();

builder.Services.AddCors(options =>
{
    // Covers both frontends (admin panel, mobile web prototype) — was scoped to just the
    // admin panel's origin, which silently CORS-blocked every request from the mobile app
    // (browser-only failure; curl/server-to-server calls never hit this, which is why it
    // looked like a validation problem from the client's error message alone).
    options.AddPolicy("Frontends", policy => policy
        .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Caps how many OTPs any one client IP can trigger — the dev SMS sender is free/local, but
// in production this is a real per-message cost and a spam/harassment vector (bombing a
// phone number with codes it never asked for) if left unbounded. Partitioned by IP (not a
// plain AddFixedWindowLimiter, which would share a single global bucket across every caller
// and 429 the whole app once 5 people anywhere had requested an OTP in the same window).
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("otp", httpContext => System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(15),
            QueueLimit = 0,
        }));
});

// TLS 1.2/1.3-only is the real posture whenever Kestrel terminates TLS directly.
// Behind a reverse proxy/load balancer (ALB, nginx, Cloudflare) that layer terminates
// TLS instead and must be configured with the same minimum version separately (see SECURITY.md).
builder.WebHost.ConfigureKestrel(options =>
{
    options.ConfigureHttpsDefaults(https =>
    {
        https.SslProtocols = System.Security.Authentication.SslProtocols.Tls12 | System.Security.Authentication.SslProtocols.Tls13;
    });
});

builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
    // Preload intentionally left off: hstspreload.org submission is a manual, one-way step
    // that must only happen after every subdomain is confirmed HTTPS-only in production.
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
        };

        // SignalR's browser/mobile WebSocket clients can't set an Authorization header,
        // so the hub connection carries the access token as a query string parameter.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken) && context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            },
            // IdentityService only checks IsDisabled at login/refresh time — an access token
            // issued before an admin disables the account otherwise stays valid for the rest
            // of its 15-minute lifetime, letting a just-disabled user keep creating/editing
            // content until it naturally expires. Checking on every request closes that gap
            // at the cost of one extra query per authenticated call.
            OnTokenValidated = async context =>
            {
                var sub = context.Principal?.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
                if (sub is null || !Guid.TryParse(sub, out var userId))
                {
                    context.Fail("Invalid token subject.");
                    return;
                }

                var db = context.HttpContext.RequestServices.GetRequiredService<TaskUpDbContext>();
                var isDisabled = await db.Users
                    .Where(u => u.Id == userId)
                    .Select(u => u.IsDisabled)
                    .FirstOrDefaultAsync();

                if (isDisabled)
                {
                    context.Fail("This account has been disabled.");
                }
            },
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("is_admin", "true"));
});

var app = builder.Build();

// Must run before anything that inspects the scheme or the client IP. In production
// the API sits behind nginx, which terminates TLS and forwards plain HTTP on an
// internal Docker network — so without this every request looks like HTTP to Kestrel,
// `UseHttpsRedirection` below answers 307 to the https URL, nginx forwards it back as
// HTTP, and the API is unreachable behind an infinite redirect loop. It also restores
// the real client IP, which the per-IP OTP rate limiter depends on to be worth anything.
//
// The proxy is a separate container on a Docker bridge network, so its address is
// in one of the private ranges below. Those ranges must be listed explicitly:
// CLEARING KnownNetworks/KnownProxies DOES NOT MEAN "TRUST EVERYTHING" — the
// middleware checks the peer against these collections and, finding both empty,
// ignores the forwarded headers entirely. That silently cost us X-Forwarded-Proto
// on the first production deploy: the app never saw a request as HTTPS, so it
// emitted no HSTS header and every client IP collapsed to the proxy's, making the
// per-IP OTP rate limit effectively global.
//
// Listing private ranges is safe because the API port is never published to the
// host — nginx is the only route in (see docker-compose.yml), so nothing outside
// can reach Kestrel to spoof these headers in the first place.
var forwardedOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost,
};
forwardedOptions.KnownNetworks.Clear();
forwardedOptions.KnownProxies.Clear();
foreach (var (prefix, length) in new[] { ("10.0.0.0", 8), ("172.16.0.0", 12), ("192.168.0.0", 16), ("127.0.0.0", 8) })
{
    forwardedOptions.KnownNetworks.Add(new Microsoft.AspNetCore.HttpOverrides.IPNetwork(IPAddress.Parse(prefix), length));
}
app.UseForwardedHeaders(forwardedOptions);

// A fixed OTP code is a deliberate stopgap while no SMS provider exists, but it must
// not be able to survive quietly into real use: refuse to boot if it is unscoped, and
// otherwise name the numbers it covers on every boot at Warning level, which is what
// production logging actually keeps.
// Say plainly which sender is live; "no SMS arrived" is otherwise indistinguishable
// from "the stand-in was registered and logged it instead".
app.Logger.LogInformation(
    "SMS delivery: {Provider}",
    string.IsNullOrWhiteSpace(authenticaOptions.ApiKey)
        ? "logging stand-in — no Authentica API key configured, so no real message is sent"
        : $"Authentica /send-otp, template {authenticaOptions.TemplateId?.ToString() ?? "<account default>"}");

var otpDevOptions = app.Services.GetRequiredService<IOptions<OtpDevOptions>>().Value;
if (otpDevOptions.IsEnabled)
{
    var allowedPhones = otpDevOptions.AllowedPhones;

    // An unscoped fixed code is not a test convenience, it is an open door: it makes
    // every account on the service reachable by anyone who knows its phone number.
    // Fail here, at deploy time with a named variable to set, rather than letting a
    // half-configured stopgap serve real traffic.
    if (allowedPhones.Count == 0 && !app.Environment.IsDevelopment())
    {
        throw new InvalidOperationException(
            "Refusing to start: Otp__FixedCode is set with no Otp__FixedCodePhones. "
            + "An unscoped fixed code lets anyone sign in as any user. "
            + "Either clear OTP_FIXED_CODE, or list the test numbers it may apply to, e.g. "
            + "OTP_FIXED_CODE_PHONES=+966500000000,+966555555555");
    }

    app.Logger.LogWarning(
        "AUTH BYPASS ACTIVE: the fixed OTP applies to {Count} allow-listed number(s): {Phones}. Everyone else gets a real random code. Clear Otp__FixedCode once SMS delivery works.",
        allowedPhones.Count,
        string.Join(", ", allowedPhones));
}

app.UseExceptionHandler();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
    // This API only ever returns JSON — 'none' is safe here. The two SPA frontends
    // (admin panel, mobile prototype) need their own CSP set by whatever serves their
    // static build in production; that's provider/host config, not this API's job.
    headers["Content-Security-Policy"] = "default-src 'none'";
    await next();
});

app.UseCors("Frontends");

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

var fileStorageOptions = app.Services.GetRequiredService<FileStorageOptions>();
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, fileStorageOptions.RootPath);
Directory.CreateDirectory(uploadsPath);

// UseStaticFiles is terminal middleware that never reaches UseAuthentication/UseAuthorization
// even when placed after them, so uploaded files (task/chat attachments) need their own
// authentication gate here — otherwise anyone who learns/guesses a storage URL could fetch
// the raw bytes regardless of the ownership check enforced by FilesController/FilesService.
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments(fileStorageOptions.PublicPathPrefix) &&
        context.User.Identity?.IsAuthenticated != true)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return;
    }

    await next();
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = fileStorageOptions.PublicPathPrefix,
});

app.MapControllers();
app.MapHub<NotificationsHub>("/hubs/notifications");

app.Run();
