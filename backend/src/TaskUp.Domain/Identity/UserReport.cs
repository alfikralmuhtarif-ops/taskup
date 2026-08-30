namespace TaskUp.Domain.Identity;

public enum UserReportStatus
{
    Open,
    Resolved,
}

/// <summary>
/// A user-submitted report against another user, optionally anchored to the specific
/// message that triggered it (App Store Guideline 1.2 requires this mechanism for
/// apps with user-generated content/1:1 chat). Reviewed by admins via /admin/reports.
/// </summary>
public class UserReport
{
    public Guid Id { get; set; }

    public Guid ReporterId { get; set; }
    public User Reporter { get; set; } = default!;

    public Guid ReportedUserId { get; set; }
    public User ReportedUser { get; set; } = default!;

    public string Reason { get; set; } = default!;

    public Guid? MessageId { get; set; }

    public UserReportStatus Status { get; set; } = UserReportStatus.Open;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? ResolvedAt { get; set; }
}
