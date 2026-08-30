using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Notifications;
using TaskUp.Domain.Notifications;
using TaskUp.Infrastructure.Persistence;
using DomainTaskStatus = TaskUp.Domain.Tasks.TaskStatus;

namespace TaskUp.Api.BackgroundJobs;

/// <summary>
/// Periodically flags newly-overdue tasks (due_date &lt; now() AND status != done,
/// contract §2.2) and notifies the owner exactly once per task via
/// NotificationCategory.DueDateOverdue.
/// </summary>
public class OverdueTaskSweepJob(IServiceScopeFactory scopeFactory, ILogger<OverdueTaskSweepJob> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(15);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);

        do
        {
            try
            {
                await SweepAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Overdue task sweep failed");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task SweepAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TaskUpDbContext>();
        var publisher = scope.ServiceProvider.GetRequiredService<INotificationPublisher>();

        var now = DateTimeOffset.UtcNow;

        var candidates = await db.Tasks
            .Where(t => t.OwnerId != null && t.DueDate != null && t.DueDate < now && t.Status != DomainTaskStatus.Done)
            .Select(t => new { t.Id, t.Title, OwnerId = t.OwnerId!.Value })
            .ToListAsync(cancellationToken);

        if (candidates.Count == 0)
        {
            return;
        }

        var alreadyNotifiedTaskIds = await db.Notifications
            .Where(n => n.Category == NotificationCategory.DueDateOverdue && n.RelatedEntityType == "TaskItem")
            .Select(n => n.RelatedEntityId)
            .ToListAsync(cancellationToken);

        foreach (var task in candidates.Where(t => !alreadyNotifiedTaskIds.Contains(t.Id)))
        {
            await publisher.PublishAsync(
                task.OwnerId, NotificationCategory.DueDateOverdue,
                "Task is overdue", task.Title, "TaskItem", task.Id, cancellationToken);
        }
    }
}
