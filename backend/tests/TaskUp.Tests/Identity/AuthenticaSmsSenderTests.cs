using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using TaskUp.Infrastructure.Identity;

namespace TaskUp.Tests.Identity;

/// <summary>
/// Pins the OTP delivery transport. The property that matters most is the failure
/// behaviour: if a code never left the building, SendAsync must throw, because the
/// caller turns a silent success into "we sent you a code" and then the user waits
/// for an SMS that is never coming.
/// </summary>
public class AuthenticaSmsSenderTests
{
    private const string Phone = "+966500000000";

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
        Func<HttpRequestMessage, HttpResponseMessage> respond, string senderName = "TaskUp")
    {
        var handler = new StubHandler(respond);
        var http = new HttpClient(handler) { BaseAddress = new Uri("https://api.authentica.sa") };
        var options = Options.Create(new AuthenticaSmsOptions { SenderName = senderName, ApiKey = "k" });

        return (new AuthenticaSmsSender(http, options, NullLogger<AuthenticaSmsSender>.Instance), handler);
    }

    private static HttpResponseMessage Ok() => new(HttpStatusCode.OK) { Content = new StringContent("{\"success\":true}") };

    // ─── Request shape ─────────────────────────────────────────────────────────

    [Fact]
    public async Task SendAsync_PostsToSendSmsWithTheFieldNamesAuthenticaExpects()
    {
        var (sender, handler) = Build(_ => Ok());

        await sender.SendAsync(Phone, "Your TaskUp verification code is 123456");

        Assert.Equal(HttpMethod.Post, handler.LastRequest!.Method);
        Assert.Equal("/api/v2/send-sms", handler.LastRequest.RequestUri!.AbsolutePath);

        // Renaming any of these silently breaks delivery, so assert the wire names
        // rather than the C# property names.
        using var body = JsonDocument.Parse(handler.LastBody!);
        Assert.Equal(Phone, body.RootElement.GetProperty("phone").GetString());
        Assert.Equal("TaskUp", body.RootElement.GetProperty("sender_name").GetString());
        Assert.Contains("123456", body.RootElement.GetProperty("message").GetString());
    }

    // ─── Input guard ───────────────────────────────────────────────────────────

    [Theory]
    [InlineData("0500000000")]
    [InlineData("966500000000")]
    [InlineData("")]
    public async Task SendAsync_NonE164Number_ThrowsWithoutCallingTheProvider(string phone)
    {
        var (sender, handler) = Build(_ => Ok());

        await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendAsync(phone, "code 123456"));

        // Caught locally: a malformed number comes back from Authentica as an opaque 400.
        Assert.Equal(0, handler.CallCount);
    }

    // ─── Failure must never look like success ──────────────────────────────────

    [Fact]
    public async Task SendAsync_ProviderUnreachable_Throws()
    {
        var (sender, _) = Build(_ => throw new HttpRequestException("connection refused"));

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendAsync(Phone, "code"));

        Assert.Contains("Could not reach the SMS provider", ex.Message);
    }

    [Fact]
    public async Task SendAsync_RequestTimesOut_Throws()
    {
        var (sender, _) = Build(_ => throw new TaskCanceledException("timed out"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendAsync(Phone, "code"));
    }

    [Theory]
    [InlineData(HttpStatusCode.BadRequest)]
    [InlineData(HttpStatusCode.Unauthorized)]
    [InlineData(HttpStatusCode.PaymentRequired)]
    [InlineData(HttpStatusCode.TooManyRequests)]
    [InlineData(HttpStatusCode.InternalServerError)]
    public async Task SendAsync_AnyNonSuccessStatus_Throws(HttpStatusCode status)
    {
        var (sender, _) = Build(_ => new HttpResponseMessage(status) { Content = new StringContent("nope") });

        await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendAsync(Phone, "code"));
    }

    [Fact]
    public async Task SendAsync_Rejected_SurfacesTheProviderBodyForDiagnosis()
    {
        const string reason = "sender_name is not registered";
        var (sender, _) = Build(_ => new HttpResponseMessage(HttpStatusCode.BadRequest)
        {
            Content = new StringContent($"{{\"message\":\"{reason}\"}}"),
        });

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendAsync(Phone, "code"));

        // The bare status code has proven useless on its own; the reason lives in the body.
        Assert.Contains("400", ex.Message);
        Assert.Contains(reason, ex.Message);
    }

    [Fact]
    public async Task SendAsync_RejectedWithAHugeBody_TruncatesItInsteadOfLoggingPagesOfHtml()
    {
        // A gateway error page can be tens of kilobytes; the sender keeps the first
        // 400 characters so the reason is still visible without flooding the log.
        var (sender, _) = Build(_ => new HttpResponseMessage(HttpStatusCode.BadGateway)
        {
            Content = new StringContent(new string('x', 5000)),
        });

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => sender.SendAsync(Phone, "code"));

        Assert.Contains("502", ex.Message);
        Assert.Equal(400, ex.Message.Count(c => c == 'x'));
    }

    [Fact]
    public async Task SendAsync_Accepted_DoesNotThrow()
    {
        var (sender, handler) = Build(_ => Ok());

        await sender.SendAsync(Phone, "code 123456");

        Assert.Equal(1, handler.CallCount);
    }

}
