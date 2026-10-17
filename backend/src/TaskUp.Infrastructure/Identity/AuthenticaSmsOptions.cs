namespace TaskUp.Infrastructure.Identity;

/// <summary>
/// Authentica (authentica.sa) — the SMS provider that delivers OTP codes.
///
/// <para>
/// We call <c>POST {BaseUrl}/send-otp</c> with <c>method: "sms"</c> and our own
/// <c>otp</c> value. An earlier version of this adapter posted to <c>/send-sms</c>
/// on the theory that a plain transport would keep the auth flow entirely ours;
/// that route does not exist — it answers 404 — and the mistake survived because
/// the tests asserted it against a stub rather than the live API.
/// </para>
///
/// <para>
/// Supplying <c>otp</c> ourselves preserves everything that made the plain-transport
/// idea attractive: the expiry window, attempt counting, per-purpose checks
/// (Login vs Register vs ChangePhone) and per-IP rate limiting all stay in
/// <see cref="IdentityService"/>, and Authentica's own <c>/verify-otp</c> is never
/// involved. They deliver the message; we remain the authority on what is valid.
/// </para>
/// </summary>
public class AuthenticaSmsOptions
{
    public const string SectionName = "Authentica";

    /// <summary>Sent as the <c>X-Authorization</c> header. Empty disables the provider
    /// and leaves the logging stand-in registered, so local development still works.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>Which approved template renders the message, as numbered in the
    /// Authentica portal. The template carries the wording and the sender identity,
    /// which is why no sender name is sent on the wire. Left unset, Authentica
    /// applies the account default.</summary>
    public int? TemplateId { get; set; }

    /// <summary>Host only. The version segment belongs to the route, which is written
    /// in full at the call site so a glance at the request shows the whole path.</summary>
    public string BaseUrl { get; set; } = "https://api.authentica.sa";

    public int TimeoutSeconds { get; set; } = 15;
}
