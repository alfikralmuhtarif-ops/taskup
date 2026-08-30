using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Shared;

namespace TaskUp.Infrastructure.Persistence.Configurations.Shared;

public class MentionConfiguration : IEntityTypeConfiguration<Mention>
{
    public void Configure(EntityTypeBuilder<Mention> builder)
    {
        builder.HasIndex(m => new { m.OwnerType, m.OwnerId });
        builder.HasIndex(m => m.MentionedUserId);

        builder.HasOne(m => m.MentionedUser)
            .WithMany()
            .HasForeignKey(m => m.MentionedUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
