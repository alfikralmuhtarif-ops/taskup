using TaskUp.Application.Notifications.Dtos;

namespace TaskUp.Application.Notifications;

public interface INotificationService
{
    Task<IReadOnlyList<NotificationDto>> ListAsync(Guid userId, string? filter, CancellationToken cancellationToken = default);

    Task MarkReadAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default);

    Task MarkAllReadAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<NotificationPreferencesDto> GetPreferencesAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<NotificationPreferencesDto> UpdatePreferencesAsync(Guid userId, UpdateNotificationPreferencesRequest request, CancellationToken cancellationToken = default);

    Task<NotificationDeliverySettingsDto> GetDeliverySettingsAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<NotificationDeliverySettingsDto> UpdateDeliverySettingsAsync(Guid userId, UpdateNotificationDeliverySettingsRequest request, CancellationToken cancellationToken = default);
}
