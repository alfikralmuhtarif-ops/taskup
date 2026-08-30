using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Tasks;

namespace TaskUp.Infrastructure.Persistence.Configurations.Tasks;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.Ignore(t => t.IsOverdue);

        builder.Property(t => t.Title).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(4000);

        builder.HasIndex(t => t.ProjectId);
        builder.HasIndex(t => t.OwnerId);
        builder.HasIndex(t => t.CreatedById);
        builder.HasIndex(t => t.DueDate);

        builder.HasOne(t => t.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.CreatedBy)
            .WithMany()
            .HasForeignKey(t => t.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Owner)
            .WithMany()
            .HasForeignKey(t => t.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.CompletedBy)
            .WithMany()
            .HasForeignKey(t => t.CompletedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Soft-delete (final-domain-model.md §12.2): excluded from default queries,
        // still reachable via IgnoreQueryFilters() for fetch-by-id.
        builder.HasQueryFilter(t => t.DeletedAt == null);
    }
}
