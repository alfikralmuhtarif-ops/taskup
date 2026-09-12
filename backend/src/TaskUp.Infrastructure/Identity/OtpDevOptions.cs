namespace TaskUp.Infrastructure.Identity;

/// <summary>
/// Dev/test convenience only: when set, the listed phone numbers receive this fixed
/// code instead of a random one, so testing doesn't require reading server logs.
/// Leave <see cref="FixedCode"/> empty (the production default) for real random codes.
///
/// The bypass is deliberately scoped to <see cref="FixedCodePhones"/>. An unscoped
/// fixed code makes every account on the service reachable by anyone who knows its
/// phone number, which is an open door rather than a test convenience — so outside
/// Development, a fixed code without an allowlist refuses to start (see Program.cs).
/// </summary>
public class OtpDevOptions
{
    public const string SectionName = "Otp";

    public string FixedCode { get; set; } = string.Empty;

    /// <summary>
    /// Comma-separated E.164 numbers the fixed code applies to, e.g.
    /// "+966500000000,+966555555555". A single string rather than an array so it
    /// stays one readable line in .env instead of Otp__FixedCodePhones__0, __1, ...
    /// </summary>
    public string FixedCodePhones { get; set; } = string.Empty;

    public bool IsEnabled => !string.IsNullOrWhiteSpace(FixedCode);

    public IReadOnlyList<string> AllowedPhones =>
        FixedCodePhones
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();

    /// <summary>
    /// Whether this specific number should get the fixed code. Everything else gets a
    /// real random one, so an unlisted account is never reachable through the bypass.
    /// </summary>
    public bool AppliesTo(string phoneE164) =>
        IsEnabled && AllowedPhones.Contains(phoneE164, StringComparer.OrdinalIgnoreCase);
}
