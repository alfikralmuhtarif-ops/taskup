using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Notifications;

namespace TaskUp.Infrastructure.Persistence.Configurations.Notifications;

public class NotificationDeliverySettingsConfiguration : IEntityTypeConfiguration<NotificationDeliverySettings>
{
    public void Configure(EntityTypeBuilder<NotificationDeliverySettings> builder)
    {
        builder.HasIndex(s => s.UserId).IsUnique();

        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
