using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Tasks;

public enum TaskActivityType
{
    Created,
    StatusChanged,
    OwnerChanged,
    ParticipantAdded,
    ParticipantRemoved,
    ChecklistItemAdded,
    ChecklistItemCompleted,
    ChecklistItemReopened,
    Completed,
    Reopened,
    Deleted,
}

/// <summary>
/// System audit trail — separate from <see cref="TaskUpdate"/> so human content and
/// system events never share a table. ActorId is null for system-driven entries
/// (e.g. an automated overdue sweep); populated for user-driven ones.
/// </summary>
public class TaskActivity
{
    public Guid Id { get; set; }

    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = default!;

    public Guid? ActorId { get; set; }
    public User? Actor { get; set; }

    public TaskActivityType Type { get; set; }

    /// <summary>Freeform structured context (e.g. old/new status) — stored as jsonb.</summary>
    public string? Metadata { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
