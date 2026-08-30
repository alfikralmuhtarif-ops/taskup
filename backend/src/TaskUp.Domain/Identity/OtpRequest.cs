namespace TaskUp.Domain.Identity;

public enum OtpPurpose
{
    Register,
    Login,
    ChangePhone,
}

/// <summary>Short-lived by design — a scheduled cleanup job may purge old rows.</summary>
public class OtpRequest
{
    public Guid Id { get; set; }

    public string Phone { get; set; } = default!;

    public string CodeHash { get; set; } = default!;

    public OtpPurpose Purpose { get; set; }

    public int Attempts { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? ConsumedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public bool IsValid => ConsumedAt is null && ExpiresAt > DateTimeOffset.UtcNow && Attempts < 5;
}
