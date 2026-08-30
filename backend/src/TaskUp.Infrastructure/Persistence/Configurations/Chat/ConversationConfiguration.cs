using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Chat;

namespace TaskUp.Infrastructure.Persistence.Configurations.Chat;

public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        // Application layer must always store the pair in a canonical order
        // (e.g. lower Guid as ParticipantAId) so this index actually enforces
        // "one conversation per pair of users" regardless of who started it.
        builder.HasIndex(c => new { c.ParticipantAId, c.ParticipantBId }).IsUnique();

        builder.HasOne(c => c.ParticipantA)
            .WithMany()
            .HasForeignKey(c => c.ParticipantAId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.ParticipantB)
            .WithMany()
            .HasForeignKey(c => c.ParticipantBId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
