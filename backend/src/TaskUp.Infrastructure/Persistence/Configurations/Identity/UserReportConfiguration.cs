using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Identity;

namespace TaskUp.Infrastructure.Persistence.Configurations.Identity;

public class UserReportConfiguration : IEntityTypeConfiguration<UserReport>
{
    public void Configure(EntityTypeBuilder<UserReport> builder)
    {
        builder.Property(r => r.Reason).HasMaxLength(2000).IsRequired();

        builder.HasIndex(r => r.Status);

        builder.HasOne(r => r.Reporter)
            .WithMany()
            .HasForeignKey(r => r.ReporterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.ReportedUser)
            .WithMany()
            .HasForeignKey(r => r.ReportedUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
