using Microsoft.EntityFrameworkCore;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Api.BackgroundJobs;

/// <summary>
/// Hard-deletes notes that have sat in Trash (DeletedAt set) for 30+ days. Notes' content is
/// encrypted at rest, but a hard delete here is a plain row delete — no decryption involved,
/// so nothing in this job ever touches note content.
/// </summary>
public class NotesTrashPurgeJob(IServiceScopeFactory scopeFactory, ILogger<NotesTrashPurgeJob> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(6);
    private static readonly TimeSpan TrashRetention = TimeSpan.FromDays(30);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);

        do
        {
            try
            {
                await PurgeAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Notes trash purge failed");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task PurgeAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TaskUpDbContext>();

        var cutoff = DateTimeOffset.UtcNow - TrashRetention;

        var expired = await db.Notes
            .IgnoreQueryFilters()
            .Where(n => n.DeletedAt != null && n.DeletedAt < cutoff)
            .ToListAsync(cancellationToken);

        if (expired.Count == 0)
        {
            return;
        }

        db.Notes.RemoveRange(expired);
        await db.SaveChangesAsync(cancellationToken);
    }
}
