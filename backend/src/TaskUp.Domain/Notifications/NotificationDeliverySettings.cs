using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Notifications;

/// <summary>
/// Device-level delivery presentation preferences — separate from category
/// enable/disable (<see cref="NotificationPreference"/>). One row per user.
/// </summary>
public class NotificationDeliverySettings
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public bool Sound { get; set; } = true;

    public bool Vibration { get; set; } = true;

    public bool Preview { get; set; } = true;

    public bool WeeklyEmail { get; set; } = false;
}
