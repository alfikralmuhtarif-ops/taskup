using TaskUp.Domain.Identity;
using TaskUp.Domain.Tasks;

namespace TaskUp.Domain.Notes;

public class Note
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    /// <summary>Encrypted at rest (AES-256-GCM) via TaskUpDbContext.OnModelCreating.</summary>
    public string Title { get; set; } = default!;

    /// <summary>Encrypted at rest (AES-256-GCM); DB column named "ContentEncrypted".</summary>
    public string Content { get; set; } = default!;

    public bool IsPinned { get; set; }

    /// <summary>Optional link to a task — a note is fully functional with no task.</summary>
    public Guid? TaskId { get; set; }
    public TaskItem? Task { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    /// <summary>Soft-delete — moves the note to Trash; hard-deleted 30 days later by NotesTrashPurgeJob.</summary>
    public DateTimeOffset? DeletedAt { get; set; }
}
