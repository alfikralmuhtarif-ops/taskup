using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Ai;

namespace TaskUp.Infrastructure.Persistence.Configurations.Ai;

public class AIRiskFlagConfiguration : IEntityTypeConfiguration<AIRiskFlag>
{
    public void Configure(EntityTypeBuilder<AIRiskFlag> builder)
    {
        builder.Property(r => r.Reason).HasMaxLength(2000).IsRequired();

        builder.HasIndex(r => r.TaskId);

        builder.HasOne(r => r.Task)
            .WithMany()
            .HasForeignKey(r => r.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
