using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Identity;

namespace TaskUp.Infrastructure.Persistence.Configurations.Identity;

public class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.Ignore(s => s.IsActive);

        builder.Property(s => s.RefreshTokenHash).HasMaxLength(500).IsRequired();
        builder.HasIndex(s => s.RefreshTokenHash).IsUnique();

        builder.Property(s => s.IpAddress).HasMaxLength(64);
        builder.Property(s => s.UserAgent).HasMaxLength(500);

        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Device)
            .WithMany()
            .HasForeignKey(s => s.DeviceId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
