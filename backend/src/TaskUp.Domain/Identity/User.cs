namespace TaskUp.Domain.Identity;

public enum Language
{
    Ar,
    En,
}

/// <summary>
/// Identity is phone-only (contract §8) — no email, no password anywhere.
/// </summary>
public class User
{
    public Guid Id { get; set; }

    /// <summary>Normalized E.164, e.g. +9665XXXXXXXX. Stored encrypted at rest — see <c>TaskUpDbContext.OnModelCreating</c>.</summary>
    public string Phone { get; set; } = default!;

    /// <summary>
    /// Unkeyed SHA-256 of <see cref="Phone"/>, kept alongside the encrypted value so it stays
    /// the unique/lookup key (AES-GCM ciphertext is non-deterministic, so it can't back equality
    /// queries) and so contact-sync (D8) can still match client-submitted hashes server-side.
    /// </summary>
    public string PhoneHash { get; set; } = default!;

    public string Name { get; set; } = default!;

    public string? AvatarUrl { get; set; }

    public Language Language { get; set; } = Language.Ar;

    public bool ContactsPermissionGranted { get; set; }

    public bool NotificationsPermissionGranted { get; set; }

    /// <summary>System-level admin flag (backend-architecture.md admin panel addendum) — deliberately just a
    /// boolean, not a roles table, to stay consistent with D7's "no complex roles engine" for resource permissions.</summary>
    public bool IsSystemAdmin { get; set; }

    /// <summary>Set by an admin to block login without deleting the account/data.</summary>
    public bool IsDisabled { get; set; }

    /// <summary>
    /// Set when the user deletes their own account (distinct from admin-initiated
    /// <see cref="IsDisabled"/>). Referential integrity means related content the user
    /// created (tasks, messages) can't be hard-deleted without breaking other users' data,
    /// so self-deletion anonymizes Name/AvatarUrl/Phone and blocks login instead — see
    /// IdentityService.DeleteAccountAsync and SECURITY.md.
    /// </summary>
    public DateTimeOffset? DeletedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
