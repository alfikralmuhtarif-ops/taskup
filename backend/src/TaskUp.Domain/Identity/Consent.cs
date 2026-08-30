namespace TaskUp.Domain.Identity;

public class Consent
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public string TermsVersion { get; set; } = default!;

    public string PrivacyVersion { get; set; } = default!;

    public DateTimeOffset AcceptedAt { get; set; }
}
