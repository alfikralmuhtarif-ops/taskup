using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Notifications;

/// <summary>
/// Normalized per-category row (D3) instead of fixed boolean columns, so new
/// categories can be added without a schema change. One row per (User, Category).
/// </summary>
public class NotificationPreference
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public NotificationCategory Category { get; set; }

    public bool IsEnabled { get; set; } = true;
}
