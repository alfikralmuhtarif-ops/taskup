using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Tasks;

/// <summary>
/// Participants add updates/files only — they cannot change status, checklist,
/// owner, or delete (D7 permission matrix).
/// </summary>
public class TaskParticipant
{
    public Guid Id { get; set; }

    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public Guid AddedById { get; set; }
    public User AddedBy { get; set; } = default!;

    public DateTimeOffset AddedAt { get; set; }
}
