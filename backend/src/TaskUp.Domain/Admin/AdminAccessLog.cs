using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Admin;

public enum AdminAccessResourceType
{
    User,
    Task,
    Project,
}

/// <summary>
/// Records every time an admin views a user/task/project detail through the admin panel —
/// the audit trail referenced in PRIVACY_POLICY.md's encryption-disclosure clause ("staff
/// access is limited to moderation/report-handling"). Written from AdminService's Get*Async
/// methods, never from the list endpoints (viewing a list of titles isn't content access;
/// opening one record to read it is).
/// </summary>
public class AdminAccessLog
{
    public Guid Id { get; set; }

    public Guid AdminUserId { get; set; }
    public User AdminUser { get; set; } = default!;

    public AdminAccessResourceType ResourceType { get; set; }

    public Guid ResourceId { get; set; }

    public DateTimeOffset AccessedAt { get; set; }
}
