using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Invites;

namespace TaskUp.Infrastructure.Persistence.Configurations.Invites;

public class InviteConfiguration : IEntityTypeConfiguration<Invite>
{
    public void Configure(EntityTypeBuilder<Invite> builder)
    {
        builder.Property(i => i.Phone).HasMaxLength(20).IsRequired();
        builder.Property(i => i.Label).HasMaxLength(200);

        // Reconciled against this on new-user registration (final-domain-model.md §6).
        builder.HasIndex(i => i.Phone);
        builder.HasIndex(i => new { i.ContextType, i.ContextId });

        builder.HasOne(i => i.Inviter)
            .WithMany()
            .HasForeignKey(i => i.InviterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.JoinedUser)
            .WithMany()
            .HasForeignKey(i => i.JoinedUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
