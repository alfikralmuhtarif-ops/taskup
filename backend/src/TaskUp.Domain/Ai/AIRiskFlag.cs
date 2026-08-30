using TaskUp.Domain.Tasks;

namespace TaskUp.Domain.Ai;

public enum AIRiskLevel
{
    Low,
    Medium,
    High,
}

/// <summary>Generated output of <c>IAiTaskInsightProvider.AssessRiskAsync</c>, cached per task.</summary>
public class AIRiskFlag
{
    public Guid Id { get; set; }

    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = default!;

    public AIRiskLevel Level { get; set; }

    public string Reason { get; set; } = default!;

    public DateTimeOffset GeneratedAt { get; set; }
}
