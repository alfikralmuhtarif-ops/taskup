using TaskUp.Domain.Tasks;

namespace TaskUp.Domain.Ai;

/// <summary>Generated output of <c>IAiTaskInsightProvider.SummarizeAsync</c>, cached per task.</summary>
public class AITaskSummary
{
    public Guid Id { get; set; }

    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = default!;

    public string Content { get; set; } = default!;

    public DateTimeOffset GeneratedAt { get; set; }
}
