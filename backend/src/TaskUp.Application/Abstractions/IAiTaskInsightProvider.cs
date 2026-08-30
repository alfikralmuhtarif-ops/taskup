namespace TaskUp.Application.Abstractions;

public record SuggestedAction(string Content);

/// <summary>
/// One interface, one LLM-backed implementation, called only from the three
/// in-scope endpoints (D5: Summary/Risk/Suggestions). Results are cached by
/// the caller into AITaskSummary/AIRiskFlag/AISuggestion — never generated
/// synchronously on every GET.
/// </summary>
public interface IAiTaskInsightProvider
{
    Task<string> GenerateSummaryAsync(Guid taskId, CancellationToken cancellationToken = default);

    Task<string?> DetectRiskAsync(Guid taskId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SuggestedAction>> GenerateSuggestionsAsync(Guid taskId, CancellationToken cancellationToken = default);
}
