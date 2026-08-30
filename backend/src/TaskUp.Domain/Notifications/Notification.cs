using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Notifications;

/// <summary>
/// NewMessage added to the locked-assumptions enum (final-domain-model.md §12.3).
/// </summary>
public enum NotificationCategory
{
    TaskAssigned,
    TaskUpdated,
    Mention,
    DueDateOverdue,
    ProjectUpdates,
    NewMessage,
}

/// <summary>
/// A single feed entry. RelatedEntityType/RelatedEntityId let the client deep-link
/// (e.g. open the Task Detail screen) without a polymorphic FK relationship.
/// </summary>
public class Notification
{
    public Guid Id { get; set; }

    public Guid RecipientId { get; set; }
    public User Recipient { get; set; } = default!;

    public NotificationCategory Category { get; set; }

    public string Title { get; set; } = default!;

    public string? Body { get; set; }

    public string? RelatedEntityType { get; set; }

    public Guid? RelatedEntityId { get; set; }

    public DateTimeOffset? ReadAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
