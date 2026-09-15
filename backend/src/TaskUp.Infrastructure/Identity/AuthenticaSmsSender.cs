using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TaskUp.Application.Abstractions;

namespace TaskUp.Infrastructure.Identity;

/// <summary>
/// Delivers OTP codes through Authentica's transactional SMS endpoint.
/// See <see cref="AuthenticaSmsOptions"/> for why send-sms rather than send-otp.
/// </summary>
public class AuthenticaSmsSender(
    HttpClient http,
    IOptions<AuthenticaSmsOptions> options,
    ILogger<AuthenticaSmsSender> logger) : ISmsSender
{
    private readonly AuthenticaSmsOptions _options = options.Value;

    private sealed record SendSmsRequest(
        [property: JsonPropertyName("phone")] string Phone,
        [property: JsonPropertyName("message")] string Message,
        [property: JsonPropertyName("sender_name")] string SenderName);

    public async Task SendAsync(string phoneE164, string message, CancellationToken cancellationToken = default)
    {
        // Phones are already stored E.164 (PhoneNumberNormalizer emits "+<cc><number>"),
        // which is the only format Authentica accepts — but assert rather than trust,
        // because a malformed number here fails as an opaque 400 from their side.
        if (!phoneE164.StartsWith('+'))
        {
            throw new InvalidOperationException(
                $"Authentica requires E.164 phone numbers; got a value not starting with '+'.");
        }

        HttpResponseMessage response;
        try
        {
            response = await http.PostAsJsonAsync(
                "/api/v2/send-sms",
                new SendSmsRequest(phoneE164, message, _options.SenderName),
                cancellationToken);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            // Deliberately rethrown rather than swallowed: if the code never left the
            // building, the caller must not tell the user "we sent you a code".
            logger.LogError(ex, "Authentica unreachable while sending to {MaskedPhone}", Mask(phoneE164));
            throw new InvalidOperationException("Could not reach the SMS provider.", ex);
        }

        if (!response.IsSuccessStatusCode)
        {
            // Body first — Authentica puts the actual reason (unregistered sender name,
            // malformed number, out of credits) in it, and the bare status code alone
            // has repeatedly proven useless for diagnosis.
            var body = await SafeReadAsync(response, cancellationToken);
            logger.LogError(
                "Authentica rejected an SMS to {MaskedPhone}: {Status} {Body}",
                Mask(phoneE164), (int)response.StatusCode, body);

            throw new InvalidOperationException(
                $"SMS provider returned {(int)response.StatusCode}. {body}");
        }

        logger.LogInformation("OTP SMS accepted by Authentica for {MaskedPhone}", Mask(phoneE164));
    }

    private static async Task<string> SafeReadAsync(HttpResponseMessage response, CancellationToken ct)
    {
        try
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            return body.Length > 400 ? body[..400] : body;
        }
        catch
        {
            return "<no readable body>";
        }
    }

    /// <summary>Never log a full phone number — it is personal data, and the same
    /// masking rule the logging stand-in already follows outside Development.</summary>
    private static string Mask(string phone) =>
        phone.Length <= 4 ? "****" : string.Concat("••••••••", phone.AsSpan(phone.Length - 4));
}
