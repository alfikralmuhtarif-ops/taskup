using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Tasks;

/// <summary>
/// D2 — replaces "subtasks"; drives Task/Project progress and the Task Report screen.
/// Mutation (add/edit/check/reorder) restricted to Creator + Owner (final-domain-model.md §12.4).
/// </summary>
public class TaskChecklistItem
{
    public Guid Id { get; set; }

    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = default!;

    public string Title { get; set; } = default!;

    public bool IsCompleted { get; set; }

    public Guid? CompletedById { get; set; }
    public User? CompletedBy { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public int SortOrder { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
