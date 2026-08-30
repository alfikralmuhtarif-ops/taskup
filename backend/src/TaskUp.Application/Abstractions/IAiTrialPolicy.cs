using TaskUp.Domain.Ai;

namespace TaskUp.Application.Abstractions;

/// <summary>
/// Entitlement gate in front of every AI call: Subscription.Status == Active
/// OR the free trial for (userId, feature) hasn't been consumed yet. The
/// trial limit shape itself is a pending product input (contract §13); this
/// interface lets that rule change without touching call sites.
/// </summary>
public interface IAiTrialPolicy
{
    Task<bool> CanUseAsync(Guid userId, AIFeature feature, CancellationToken cancellationToken = default);

    Task RecordUsageAsync(Guid userId, AIFeature feature, CancellationToken cancellationToken = default);
}
