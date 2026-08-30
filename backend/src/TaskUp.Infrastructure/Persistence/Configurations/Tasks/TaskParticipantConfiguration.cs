using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Tasks;

namespace TaskUp.Infrastructure.Persistence.Configurations.Tasks;

public class TaskParticipantConfiguration : IEntityTypeConfiguration<TaskParticipant>
{
    public void Configure(EntityTypeBuilder<TaskParticipant> builder)
    {
        builder.HasIndex(tp => new { tp.TaskId, tp.UserId }).IsUnique();

        builder.HasOne(tp => tp.Task)
            .WithMany(t => t.Participants)
            .HasForeignKey(tp => tp.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(tp => tp.User)
            .WithMany()
            .HasForeignKey(tp => tp.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(tp => tp.AddedBy)
            .WithMany()
            .HasForeignKey(tp => tp.AddedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
