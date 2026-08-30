using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Domain.Ai;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Ai;

/// <summary>
/// One-time free trial per (user, feature) unless the user has an active Pro
/// subscription. The trial *limit shape* is a pending product input (contract
/// §13) — kept behind this interface so the rule can change without touching callers.
/// </summary>
public class TrialAiPolicy(TaskUpDbContext db) : IAiTrialPolicy
{
    public async Task<bool> CanUseAsync(Guid userId, AIFeature feature, CancellationToken cancellationToken = default)
    {
        var hasActiveSubscription = await db.Subscriptions.AnyAsync(
            s => s.UserId == userId && s.Plan == SubscriptionPlan.Pro && s.Status == SubscriptionStatus.Active
                 && (s.ExpiresAt == null || s.ExpiresAt > DateTimeOffset.UtcNow),
            cancellationToken);

        if (hasActiveSubscription)
        {
            return true;
        }

        var usage = await db.AIFeatureTrialUsages.FirstOrDefaultAsync(u => u.UserId == userId && u.Feature == feature, cancellationToken);
        return usage is null || usage.UsageCount == 0;
    }

    public async Task RecordUsageAsync(Guid userId, AIFeature feature, CancellationToken cancellationToken = default)
    {
        var usage = await db.AIFeatureTrialUsages.FirstOrDefaultAsync(u => u.UserId == userId && u.Feature == feature, cancellationToken);
        if (usage is null)
        {
            usage = new AIFeatureTrialUsage { Id = Guid.NewGuid(), UserId = userId, Feature = feature };
            db.AIFeatureTrialUsages.Add(usage);
        }

        usage.UsageCount++;
        usage.LastUsedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
    }
}
