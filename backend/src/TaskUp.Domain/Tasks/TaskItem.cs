using TaskUp.Domain.Identity;
using TaskUp.Domain.Projects;

namespace TaskUp.Domain.Tasks;

public enum TaskStatus
{
    NotStarted,
    InProgress,
    Done,
}

/// <summary>
/// Named TaskItem (not Task) to avoid colliding with System.Threading.Tasks.Task.
/// </summary>
public class TaskItem
{
    public Guid Id { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public TaskStatus Status { get; set; } = TaskStatus.NotStarted;

    /// <summary>Optional — a task is fully functional with no project (spec Principle 3).</summary>
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }

    /// <summary>The Creator — edits task settings, deletes, changes Owner (D7).</summary>
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = default!;

    /// <summary>
    /// The Owner (spec's "المسؤول") — exactly one person, nullable until assigned,
    /// never a list. Executes the task: status, checklist (D7).
    /// </summary>
    public Guid? OwnerId { get; set; }
    public User? Owner { get; set; }

    public DateTimeOffset? DueDate { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public Guid? CompletedById { get; set; }
    public User? CompletedBy { get; set; }

    /// <summary>Soft-delete (locked assumption, final-domain-model.md §12.2).</summary>
    public DateTimeOffset? DeletedAt { get; set; }

    public ICollection<TaskParticipant> Participants { get; set; } = new List<TaskParticipant>();

    public ICollection<TaskChecklistItem> ChecklistItems { get; set; } = new List<TaskChecklistItem>();

    public ICollection<TaskUpdate> Updates { get; set; } = new List<TaskUpdate>();

    public ICollection<TaskActivity> Activities { get; set; } = new List<TaskActivity>();

    public bool IsOverdue => DueDate is not null && DueDate < DateTimeOffset.UtcNow && Status != TaskStatus.Done;

    /// <summary>completed checklist items / total — null (not a fabricated number) if no checklist (D2).</summary>
    public static int? ComputeProgress(int total, int completed) =>
        total == 0 ? null : (int)Math.Round(completed * 100.0 / total);
}
