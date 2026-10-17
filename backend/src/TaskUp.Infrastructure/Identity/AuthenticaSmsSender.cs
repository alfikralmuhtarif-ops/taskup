using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TaskUp.Application.Abstractions;

namespace TaskUp.Infrastructure.Identity;

/// <summary>
/// Delivers OTP codes through Authentica's send-otp endpoint.
/// See <see cref="AuthenticaSmsOptions"/> for why we supply the code ourselves.
/// </summary>
public class AuthenticaSmsSender(
    HttpClient http,
    IOptions<AuthenticaSmsOptions> options,
    ILogger<AuthenticaSmsSender> logger) : ISmsSender
{
    private readonly AuthenticaSmsOptions _options = options.Value;

    /// <summary>Omitted fields are left off the wire entirely rather than sent as
    /// null, because Authentica validates types and a null template_id is not an
    /// integer.</summary>
    private sealed record SendOtpRequest(
        [property: JsonPropertyName("method")] string Method,
        [property: JsonPropertyName("phone")] string Phone,
        [property: JsonPropertyName("otp")] string Otp,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        [property: JsonPropertyName("template_id")] int? TemplateId);

    public async Task SendOtpAsync(string phoneE164, string code, CancellationToken cancellationToken = default)
    {
        // Phones are already stored E.164 (PhoneNumberNormalizer emits "+<cc><number>"),
        // which is the only format Authentica accepts — but assert rather than trust,
        // because a malformed number here fails as an opaque 400 from their side.
        if (!phoneE164.StartsWith('+'))
        {
            throw new InvalidOperationException(
                "Authentica requires E.164 phone numbers; got a value not starting with '+'.");
        }

        // Their documented bound. Caught here because a code outside it comes back as
        // a validation error that says nothing about which field was wrong.
        if (code.Length is < 4 or > 12 || !code.All(char.IsAsciiDigit))
        {
            throw new InvalidOperationException(
                $"Authentica accepts a 4-12 digit numeric code; got {code.Length} character(s).");
        }

        HttpResponseMessage response;
        try
        {
            response = await http.PostAsJsonAsync(
                "/api/v2/send-otp",
                new SendOtpRequest("sms", phoneE164, code, _options.TemplateId),
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
            // Body first — Authentica puts the actual reason (unknown template, malformed
            // number, out of credits) in it, and the bare status code alone has repeatedly
            // proven useless for diagnosis. A 404 here means the route itself is wrong.
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
