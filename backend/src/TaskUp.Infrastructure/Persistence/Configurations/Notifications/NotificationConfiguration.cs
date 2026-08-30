using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Notifications;

namespace TaskUp.Infrastructure.Persistence.Configurations.Notifications;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.Property(n => n.Title).HasMaxLength(300).IsRequired();
        builder.Property(n => n.Body).HasMaxLength(2000);
        builder.Property(n => n.RelatedEntityType).HasMaxLength(50);

        builder.HasIndex(n => new { n.RecipientId, n.CreatedAt });

        builder.HasOne(n => n.Recipient)
            .WithMany()
            .HasForeignKey(n => n.RecipientId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
