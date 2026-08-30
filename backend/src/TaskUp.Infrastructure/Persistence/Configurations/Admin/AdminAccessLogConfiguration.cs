using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Admin;

namespace TaskUp.Infrastructure.Persistence.Configurations.Admin;

public class AdminAccessLogConfiguration : IEntityTypeConfiguration<AdminAccessLog>
{
    public void Configure(EntityTypeBuilder<AdminAccessLog> builder)
    {
        builder.HasIndex(l => l.AccessedAt);
        builder.HasIndex(l => new { l.ResourceType, l.ResourceId });

        builder.HasOne(l => l.AdminUser)
            .WithMany()
            .HasForeignKey(l => l.AdminUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
