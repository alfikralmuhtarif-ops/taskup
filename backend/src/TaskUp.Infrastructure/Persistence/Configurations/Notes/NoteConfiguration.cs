using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Notes;

namespace TaskUp.Infrastructure.Persistence.Configurations.Notes;

public class NoteConfiguration : IEntityTypeConfiguration<Note>
{
    public void Configure(EntityTypeBuilder<Note> builder)
    {
        builder.Property(n => n.Title).HasMaxLength(200).IsRequired();

        // Composite index for the real app query path: per-user, not-deleted, sorted by
        // recency. A standalone index on DeletedAt alone serves NotesTrashPurgeJob's
        // cross-user sweep (WHERE DeletedAt < now - 30d), which isn't scoped to one user.
        builder.HasIndex(n => new { n.UserId, n.DeletedAt, n.UpdatedAt });
        builder.HasIndex(n => n.DeletedAt);

        builder.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Deleting a task unlinks the note rather than deleting it or blocking the task delete.
        builder.HasOne(n => n.Task)
            .WithMany()
            .HasForeignKey(n => n.TaskId)
            .OnDelete(DeleteBehavior.SetNull);

        // Soft-delete: excluded from default queries, still reachable via IgnoreQueryFilters()
        // for the Trash view and the purge job (same pattern as TaskItemConfiguration).
        builder.HasQueryFilter(n => n.DeletedAt == null);
    }
}
