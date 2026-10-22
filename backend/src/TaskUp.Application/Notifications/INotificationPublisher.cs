using TaskUp.Domain.Notifications;

namespace TaskUp.Application.Notifications;

/// <summary>
/// Cross-module fan-out point: Tasks/Chat/Projects call this on the events that
/// matter (assigned, mentioned, new message, ...) instead of writing to the
/// Notifications tables directly. Respects the recipient's category preference
/// (D3) before creating a row or pushing, and puts the title into the recipient's
/// own language (see <see cref="NotificationText"/>).
/// </summary>
public interface INotificationPublisher
{
    Task PublishAsync(
        Guid recipientId,
        NotificationCategory category,
        NotificationText title,
        string? body,
        string? relatedEntityType,
        Guid? relatedEntityId,
        CancellationToken cancellationToken = default);
}
