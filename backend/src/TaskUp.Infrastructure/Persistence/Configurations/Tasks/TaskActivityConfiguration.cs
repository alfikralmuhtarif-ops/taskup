using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Tasks;

namespace TaskUp.Infrastructure.Persistence.Configurations.Tasks;

public class TaskActivityConfiguration : IEntityTypeConfiguration<TaskActivity>
{
    public void Configure(EntityTypeBuilder<TaskActivity> builder)
    {
        builder.Property(a => a.Metadata).HasColumnType("jsonb");

        builder.HasIndex(a => a.TaskId);

        builder.HasOne(a => a.Task)
            .WithMany(t => t.Activities)
            .HasForeignKey(a => a.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Actor)
            .WithMany()
            .HasForeignKey(a => a.ActorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
