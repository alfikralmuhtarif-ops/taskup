using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Tasks;

namespace TaskUp.Infrastructure.Persistence.Configurations.Tasks;

public class TaskChecklistItemConfiguration : IEntityTypeConfiguration<TaskChecklistItem>
{
    public void Configure(EntityTypeBuilder<TaskChecklistItem> builder)
    {
        builder.Property(c => c.Title).HasMaxLength(300).IsRequired();

        builder.HasIndex(c => new { c.TaskId, c.SortOrder });

        builder.HasOne(c => c.Task)
            .WithMany(t => t.ChecklistItems)
            .HasForeignKey(c => c.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.CompletedBy)
            .WithMany()
            .HasForeignKey(c => c.CompletedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
