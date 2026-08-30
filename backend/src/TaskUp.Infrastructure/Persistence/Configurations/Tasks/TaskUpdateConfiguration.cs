using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Tasks;

namespace TaskUp.Infrastructure.Persistence.Configurations.Tasks;

public class TaskUpdateConfiguration : IEntityTypeConfiguration<TaskUpdate>
{
    public void Configure(EntityTypeBuilder<TaskUpdate> builder)
    {
        builder.Property(u => u.Text).HasMaxLength(4000);

        builder.HasIndex(u => u.TaskId);

        builder.HasOne(u => u.Task)
            .WithMany(t => t.Updates)
            .HasForeignKey(u => u.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(u => u.Author)
            .WithMany()
            .HasForeignKey(u => u.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
