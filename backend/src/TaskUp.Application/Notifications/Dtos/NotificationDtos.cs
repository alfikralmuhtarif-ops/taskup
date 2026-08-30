namespace TaskUp.Application.Notifications.Dtos;

public record NotificationDto(
    Guid Id,
    string Category,
    string Title,
    string? Body,
    string? RelatedEntityType,
    Guid? RelatedEntityId,
    DateTimeOffset? ReadAt,
    DateTimeOffset CreatedAt);

public record NotificationPreferencesDto(
    bool TaskAssigned,
    bool TaskUpdated,
    bool Mention,
    bool DueDateOverdue,
    bool ProjectUpdates,
    bool NewMessage);

public record UpdateNotificationPreferencesRequest(
    bool? TaskAssigned,
    bool? TaskUpdated,
    bool? Mention,
    bool? DueDateOverdue,
    bool? ProjectUpdates,
    bool? NewMessage);

public record NotificationDeliverySettingsDto(bool Sound, bool Vibration, bool Preview, bool WeeklyEmail);

public record UpdateNotificationDeliverySettingsRequest(bool? Sound, bool? Vibration, bool? Preview, bool? WeeklyEmail);
