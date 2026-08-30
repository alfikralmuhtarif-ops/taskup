using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Application.Notifications;
using TaskUp.Application.Notifications.Dtos;
using TaskUp.Domain.Notifications;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Notifications;

public class NotificationService(TaskUpDbContext db) : INotificationService
{
    public async Task<IReadOnlyList<NotificationDto>> ListAsync(Guid userId, string? filter, CancellationToken cancellationToken = default)
    {
        var query = db.Notifications.Where(n => n.RecipientId == userId);
        if (filter == "unread")
        {
            query = query.Where(n => n.ReadAt == null);
        }

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(100)
            .Select(n => new NotificationDto(
                n.Id, n.Category.ToString(), n.Title, n.Body, n.RelatedEntityType, n.RelatedEntityId, n.ReadAt, n.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task MarkReadAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default)
    {
        var notification = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.RecipientId == userId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Notifications.Notification), notificationId);

        notification.ReadAt ??= DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkAllReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        await db.Notifications
            .Where(n => n.RecipientId == userId && n.ReadAt == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(n => n.ReadAt, now), cancellationToken);
    }

    public async Task<NotificationPreferencesDto> GetPreferencesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var rows = await db.NotificationPreferences.Where(p => p.UserId == userId).ToListAsync(cancellationToken);
        return ToPreferencesDto(rows);
    }

    public async Task<NotificationPreferencesDto> UpdatePreferencesAsync(Guid userId, UpdateNotificationPreferencesRequest request, CancellationToken cancellationToken = default)
    {
        var updates = new Dictionary<NotificationCategory, bool?>
        {
            [NotificationCategory.TaskAssigned] = request.TaskAssigned,
            [NotificationCategory.TaskUpdated] = request.TaskUpdated,
            [NotificationCategory.Mention] = request.Mention,
            [NotificationCategory.DueDateOverdue] = request.DueDateOverdue,
            [NotificationCategory.ProjectUpdates] = request.ProjectUpdates,
            [NotificationCategory.NewMessage] = request.NewMessage,
        };

        var existing = await db.NotificationPreferences.Where(p => p.UserId == userId).ToListAsync(cancellationToken);

        foreach (var (category, value) in updates)
        {
            if (value is null) continue;

            var row = existing.FirstOrDefault(p => p.Category == category);
            if (row is null)
            {
                row = new NotificationPreference { Id = Guid.NewGuid(), UserId = userId, Category = category, IsEnabled = value.Value };
                db.NotificationPreferences.Add(row);
                existing.Add(row);
            }
            else
            {
                row.IsEnabled = value.Value;
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        return ToPreferencesDto(existing);
    }

    public async Task<NotificationDeliverySettingsDto> GetDeliverySettingsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var settings = await db.NotificationDeliverySettings.FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
        return settings is null
            ? new NotificationDeliverySettingsDto(true, true, true, false)
            : new NotificationDeliverySettingsDto(settings.Sound, settings.Vibration, settings.Preview, settings.WeeklyEmail);
    }

    public async Task<NotificationDeliverySettingsDto> UpdateDeliverySettingsAsync(Guid userId, UpdateNotificationDeliverySettingsRequest request, CancellationToken cancellationToken = default)
    {
        var settings = await db.NotificationDeliverySettings.FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
        if (settings is null)
        {
            settings = new NotificationDeliverySettings { Id = Guid.NewGuid(), UserId = userId };
            db.NotificationDeliverySettings.Add(settings);
        }

        if (request.Sound is not null) settings.Sound = request.Sound.Value;
        if (request.Vibration is not null) settings.Vibration = request.Vibration.Value;
        if (request.Preview is not null) settings.Preview = request.Preview.Value;
        if (request.WeeklyEmail is not null) settings.WeeklyEmail = request.WeeklyEmail.Value;

        await db.SaveChangesAsync(cancellationToken);
        return new NotificationDeliverySettingsDto(settings.Sound, settings.Vibration, settings.Preview, settings.WeeklyEmail);
    }

    private static NotificationPreferencesDto ToPreferencesDto(IReadOnlyCollection<NotificationPreference> rows)
    {
        bool IsEnabled(NotificationCategory category) => rows.FirstOrDefault(r => r.Category == category)?.IsEnabled ?? true;

        return new NotificationPreferencesDto(
            IsEnabled(NotificationCategory.TaskAssigned),
            IsEnabled(NotificationCategory.TaskUpdated),
            IsEnabled(NotificationCategory.Mention),
            IsEnabled(NotificationCategory.DueDateOverdue),
            IsEnabled(NotificationCategory.ProjectUpdates),
            IsEnabled(NotificationCategory.NewMessage));
    }
}
