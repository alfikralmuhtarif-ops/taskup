namespace TaskUp.Domain.Identity;

/// <summary>
/// Refresh-token tracking, one row per issued refresh token so it can be
/// revoked server-side (contract §8).
/// </summary>
public class Session
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    /// <summary>Never store the raw refresh token — only its hash.</summary>
    public string RefreshTokenHash { get; set; } = default!;

    public Guid? DeviceId { get; set; }
    public Device? Device { get; set; }

    public DateTimeOffset IssuedAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? RevokedAt { get; set; }

    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    public bool IsActive => RevokedAt is null && ExpiresAt > DateTimeOffset.UtcNow;
}
