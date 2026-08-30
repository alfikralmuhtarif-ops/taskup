using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Tasks;

public enum TaskUpdateType
{
    Text,
    Image,
    File,
    Voice,
}

/// <summary>
/// Human-authored task feed content only — always has a real AuthorId, never system-generated.
/// System/audit events live separately in <see cref="TaskActivity"/>; Task Detail's timeline
/// is a query-time merge of both (final-domain-model.md §3).
/// </summary>
public class TaskUpdate
{
    public Guid Id { get; set; }

    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = default!;

    public Guid AuthorId { get; set; }
    public User Author { get; set; } = default!;

    public TaskUpdateType Type { get; set; } = TaskUpdateType.Text;

    public string? Text { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
