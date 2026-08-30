using TaskUp.Domain.Tasks;

namespace TaskUp.Domain.Ai;

public enum AISuggestionStatus
{
    Pending,
    Accepted,
    Dismissed,
}

/// <summary>
/// Generated output of <c>IAiTaskInsightProvider.SuggestActionsAsync</c>. Accepting a
/// suggestion creates a <see cref="TaskChecklistItem"/> (D2) — AcceptedChecklistItemId
/// records that link.
/// </summary>
public class AISuggestion
{
    public Guid Id { get; set; }

    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = default!;

    public string Content { get; set; } = default!;

    public AISuggestionStatus Status { get; set; } = AISuggestionStatus.Pending;

    public Guid? AcceptedChecklistItemId { get; set; }
    public TaskChecklistItem? AcceptedChecklistItem { get; set; }

    public DateTimeOffset GeneratedAt { get; set; }
}
