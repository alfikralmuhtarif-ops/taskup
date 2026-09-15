namespace TaskUp.Infrastructure.Identity;

/// <summary>
/// Authentica (authentica.sa) — the SMS provider that delivers OTP codes.
///
/// <para>
/// We use their <c>/api/v2/send-sms</c> endpoint, not <c>/api/v2/send-otp</c>. The
/// latter would have Authentica generate and verify the code, which means handing them
/// the whole authentication flow: our own expiry window, attempt counting, per-purpose
/// checks (Login vs Register vs ChangePhone) and per-IP rate limiting all live in
/// <see cref="IdentityService"/> and would have to be torn out. <c>send-sms</c> is a
/// plain transport, which is exactly what <c>ISmsSender</c> was defined to be.
/// </para>
/// </summary>
public class AuthenticaSmsOptions
{
    public const string SectionName = "Authentica";

    /// <summary>Sent as the <c>X-Authorization</c> header. Empty disables the provider
    /// and leaves the logging stand-in registered, so local development still works.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>Must already be approved in the Authentica portal — an unregistered
    /// name is rejected with 400, not silently substituted.</summary>
    public string SenderName { get; set; } = string.Empty;

    public string BaseUrl { get; set; } = "https://api.authentica.sa";

    public int TimeoutSeconds { get; set; } = 15;
}
