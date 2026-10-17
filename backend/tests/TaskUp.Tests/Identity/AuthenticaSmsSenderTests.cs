using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using TaskUp.Infrastructure.Identity;

namespace TaskUp.Tests.Identity;

/// <summary>
/// Pins the OTP delivery transport against Authentica's real contract.
///
/// <para>
/// An earlier version of this file asserted a <c>/send-sms</c> route with
/// <c>sender_name</c> and <c>message</c> fields. Every test passed, because they
/// were asserted against a stub that answered whatever it was asked — while the
/// live API returned 404 for that route, which no test could see. The route and
/// field names below were read off Authentica's published client, so the assertions
/// are worth something; what a stub cannot tell us is still verified by a real send.
/// </para>
/// </summary>
public class AuthenticaSmsSenderTests
{
    private const string Phone = "+966500000000";
    private const string Code = "123456";

    /// <summary>Captures the outgoing request and returns a canned reply, so nothing
    /// leaves the test process and no real SMS credit is spent.</summary>
    private sealed class StubHandler(Func<HttpRequestMessage, HttpResponseMessage> respond) : HttpMessageHandler
    {
        public HttpRequestMessage? LastRequest { get; private set; }
        public string? LastBody { get; private set; }
        public int CallCount { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            CallCount++;
            LastRequest = request;
            LastBody = request.Content is null ? null : await request.Content.ReadAsStringAsync(cancellationToken);
            return respond(request);
        }
    }

    private static (AuthenticaSmsSender Sender, StubHandler Handler) Build(
        Func<HttpRequestMessage, HttpResponseMessage> respond, int? templateId = null)
    {
        var handler = new StubHandler(respond);
        var http = new HttpClient(handler) { BaseAddress = new Uri("https://api.authentica.sa") };
        var options = Options.Create(new AuthenticaSmsOptions { ApiKey = "k", TemplateId = templateId });

        return (new AuthenticaSmsSender(http, options, NullLogger<AuthenticaSmsSender>.Instance), handler);
    }

    private static HttpResponseMessage Ok() => new(HttpStatusCode.OK) { Content = new StringContent("{\"success\":true}") };

    // ─── Request shape ─────────────────────────────────────────────────────────

    /// <summary>The 404 that took production down was exactly this path being wrong.</summary>
    [Fact]
    public async Task SendOtpAsync_PostsToSendOtpWithTheFieldNamesAuthenticaExpects()
    {
        var (sender, handler) = Build(_ => Ok());

        await sender.SendOtpAsync(Phone, Code);

        Assert.Equal(HttpMethod.Post, handler.LastRequest!.Method);
        Assert.Equal("/api/v2/send-otp", handler.LastRequest.RequestUri!.AbsolutePath);

        // Renaming any of these silently breaks delivery, so assert the wire names
        // rather than the C# property names.
        using var body = JsonDocument.Parse(handler.LastBody!);
        Assert.Equal("sms", body.RootElement.GetProperty("method").GetString());
        Assert.Equal(Phone, body.RootElement.GetProperty("phone").GetString());
        Assert.Equal(Code, body.RootElement.GetProperty("otp").GetString());
    }

    /// <summary>A null template_id must be absent, not null: Authentica validates the
    /// field as an integer and a present null fails that check.</summary>
    [Fact]
    public async Task SendOtpAsync_NoTemplateConfigured_OmitsTheFieldEntirely()
    {
        var (sender, handler) = Build(_ => Ok());

        await sender.SendOtpAsync(Phone, Code);

        using var body = JsonDocument.Parse(handler.LastBody!);
        Assert.False(body.RootElement.TryGetProperty("template_id", out _));
    }

    [Fact]
    public async Task SendOtpAsync_TemplateConfigured_SendsItAsAnInteger()
    {
        var (sender, handler) = Build(_ => Ok(), templateId: 31);

        await sender.SendOtpAsync(Phone, Code);

        using var body = JsonDocument.Parse(handler.LastBody!);
        Assert.Equal(31, body.RootElement.GetProperty("template_id").GetInt32());
    }

    // ─── Input guards ──────────────────────────────────────────────────────────

    [Theory]
    [InlineData("0500000000")]
    [InlineData("966500000000")]
    [InlineData("")]
    public async Task SendOtpAsync_NonE164Number_ThrowsWithoutCallingTheProvider(string phone)
    {
        var (sender, handler) = Build(_ => Ok());

        await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendOtpAsync(phone, Code));

        // Caught locally: a malformed number comes back from Authentica as an opaque 400.
        Assert.Equal(0, handler.CallCount);
    }

    /// <summary>Authentica accepts 4-12 digits. Anything else is caught here, where the
    /// message names the problem, rather than as an unlabelled validation error.</summary>
    [Theory]
    [InlineData("123")]
    [InlineData("1234567890123")]
    [InlineData("12a456")]
    [InlineData("")]
    public async Task SendOtpAsync_CodeOutsideTheAcceptedShape_ThrowsWithoutCallingTheProvider(string code)
    {
        var (sender, handler) = Build(_ => Ok());

        await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendOtpAsync(Phone, code));

        Assert.Equal(0, handler.CallCount);
    }

    // ─── Failure must never look like success ──────────────────────────────────

    [Fact]
    public async Task SendOtpAsync_ProviderUnreachable_Throws()
    {
        var (sender, _) = Build(_ => throw new HttpRequestException("connection refused"));

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendOtpAsync(Phone, Code));

        Assert.Contains("Could not reach the SMS provider", ex.Message);
    }

    [Fact]
    public async Task SendOtpAsync_RequestTimesOut_Throws()
    {
        var (sender, _) = Build(_ => throw new TaskCanceledException("timed out"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendOtpAsync(Phone, Code));
    }

    [Theory]
    [InlineData(HttpStatusCode.BadRequest)]
    [InlineData(HttpStatusCode.Unauthorized)]
    [InlineData(HttpStatusCode.PaymentRequired)]
    [InlineData(HttpStatusCode.NotFound)]
    [InlineData(HttpStatusCode.TooManyRequests)]
    [InlineData(HttpStatusCode.InternalServerError)]
    public async Task SendOtpAsync_AnyNonSuccessStatus_Throws(HttpStatusCode status)
    {
        var (sender, _) = Build(_ => new HttpResponseMessage(status) { Content = new StringContent("nope") });

        await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendOtpAsync(Phone, Code));
    }

    [Fact]
    public async Task SendOtpAsync_Rejected_SurfacesTheProviderBodyForDiagnosis()
    {
        const string reason = "template_id is invalid";
        var (sender, _) = Build(_ => new HttpResponseMessage(HttpStatusCode.BadRequest)
        {
            Content = new StringContent($"{{\"message\":\"{reason}\"}}"),
        });

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendOtpAsync(Phone, Code));

        // The bare status code has proven useless on its own; the reason lives in the body.
        Assert.Contains("400", ex.Message);
        Assert.Contains(reason, ex.Message);
    }

    [Fact]
    public async Task SendOtpAsync_RejectedWithAHugeBody_TruncatesItInsteadOfLoggingPagesOfHtml()
    {
        // A gateway error page can be tens of kilobytes; the sender keeps the first
        // 400 characters so the reason is still visible without flooding the log.
        var (sender, _) = Build(_ => new HttpResponseMessage(HttpStatusCode.BadGateway)
        {
            Content = new StringContent(new string('x', 5000)),
        });

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendOtpAsync(Phone, Code));

        Assert.Contains("502", ex.Message);
        Assert.Equal(400, ex.Message.Count(c => c == 'x'));
    }

    [Fact]
    public async Task SendOtpAsync_Accepted_DoesNotThrow()
    {
        var (sender, handler) = Build(_ => Ok());

        await sender.SendOtpAsync(Phone, Code);

        Assert.Equal(1, handler.CallCount);
    }
}
