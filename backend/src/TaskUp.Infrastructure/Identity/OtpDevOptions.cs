namespace TaskUp.Infrastructure.Identity;

/// <summary>
/// Dev/test convenience only: when set, every OTP issued uses this fixed code
/// instead of a random one, so local testing doesn't require reading server logs.
/// Leave empty (the production default) to generate real random codes.
/// </summary>
public class OtpDevOptions
{
    public const string SectionName = "Otp";

    public string FixedCode { get; set; } = string.Empty;
}
