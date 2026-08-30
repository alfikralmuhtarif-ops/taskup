using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Ai;

namespace TaskUp.Infrastructure.Persistence.Configurations.Ai;

public class AIFeatureTrialUsageConfiguration : IEntityTypeConfiguration<AIFeatureTrialUsage>
{
    public void Configure(EntityTypeBuilder<AIFeatureTrialUsage> builder)
    {
        builder.HasIndex(u => new { u.UserId, u.Feature }).IsUnique();

        builder.HasOne(u => u.User)
            .WithMany()
            .HasForeignKey(u => u.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
