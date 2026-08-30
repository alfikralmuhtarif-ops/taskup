using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Ai;

namespace TaskUp.Infrastructure.Persistence.Configurations.Ai;

public class AITaskSummaryConfiguration : IEntityTypeConfiguration<AITaskSummary>
{
    public void Configure(EntityTypeBuilder<AITaskSummary> builder)
    {
        builder.Property(s => s.Content).HasMaxLength(4000).IsRequired();

        builder.HasIndex(s => s.TaskId);

        builder.HasOne(s => s.Task)
            .WithMany()
            .HasForeignKey(s => s.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
