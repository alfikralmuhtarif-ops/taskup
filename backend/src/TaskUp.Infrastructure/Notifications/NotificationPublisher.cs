using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Notifications;
using TaskUp.Application.RealTime;
using TaskUp.Domain.Notifications;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Notifications;

public class NotificationPublisher(TaskUpDbContext db, IPushSender pushSender, IRealTimeNotifier realTimeNotifier) : INotificationPublisher
{
    public async Task PublishAsync(
        Guid recipientId,
        NotificationCategory category,
        string title,
        string? body,
        string? relatedEntityType,
        Guid? relatedEntityId,
        CancellationToken cancellationToken = default)
    {
        var preference = await db.NotificationPreferences
            .FirstOrDefaultAsync(p => p.UserId == recipientId && p.Category == category, cancellationToken);

        if (preference is { IsEnabled: false })
        {
            return;
        }

        var notification = new Domain.Notifications.Notification
        {
            Id = Guid.NewGuid(),
            RecipientId = recipientId,
            Category = category,
            Title = title,
            Body = body,
            RelatedEntityType = relatedEntityType,
            RelatedEntityId = relatedEntityId,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        db.Notifications.Add(notification);

        await db.SaveChangesAsync(cancellationToken);

        await realTimeNotifier.NotifyUserAsync(recipientId, "notification:new", new
        {
            notification.Id,
            Category = category.ToString(),
            notification.Title,
            notification.Body,
            notification.RelatedEntityType,
            notification.RelatedEntityId,
            notification.CreatedAt,
        }, cancellationToken);

        var pushTokens = await db.Devices.Where(d => d.UserId == recipientId).Select(d => d.PushToken).ToListAsync(cancellationToken);
        if (pushTokens.Count > 0)
        {
            await pushSender.SendAsync(pushTokens, title, body, cancellationToken: cancellationToken);
        }
    }
}
