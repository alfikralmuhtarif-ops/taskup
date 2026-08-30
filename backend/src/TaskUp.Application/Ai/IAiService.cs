using TaskUp.Application.Ai.Dtos;
using TaskUp.Application.Tasks.Dtos;

namespace TaskUp.Application.Ai;

/// <summary>
/// Orchestrates entitlement (Subscription/trial) + the <see cref="IAiTaskInsightProvider"/>
/// adapter + result caching. D5 scope only: Summary/Risk/Suggestions.
/// </summary>
public interface IAiService
{
    Task<SubscriptionDto> GetSubscriptionAsync(Guid userId, CancellationToken cancellationToken = default);

    Task StartTrialAsync(Guid userId, StartTrialRequest request, CancellationToken cancellationToken = default);

    Task<SubscriptionDto> CheckoutAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<AiTaskSummaryDto> GetSummaryAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);

    Task<AiTaskRiskDto> GetRiskAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AiSuggestionDto>> GetSuggestionsAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);

    /// <summary>Creates a TaskChecklistItem (D2) — the AI module never writes Task entities on its own initiative.</summary>
    Task<ChecklistItemDto> AcceptSuggestionAsync(Guid userId, Guid taskId, Guid suggestionId, CancellationToken cancellationToken = default);

    Task DismissSuggestionAsync(Guid userId, Guid taskId, Guid suggestionId, CancellationToken cancellationToken = default);
}
