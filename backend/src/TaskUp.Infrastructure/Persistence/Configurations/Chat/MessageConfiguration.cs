using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Chat;

namespace TaskUp.Infrastructure.Persistence.Configurations.Chat;

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        // No HasMaxLength: the stored value is AES-GCM ciphertext (base64, larger than the
        // plaintext message), converted transparently in TaskUpDbContext.OnModelCreating.
        // The previous 4000-char limit was a column constraint only — nothing in ChatService
        // enforced it at the application level, so removing it changes no observed behavior.
        builder.Property(m => m.Text);

        builder.HasIndex(m => m.ConversationId);

        builder.HasOne(m => m.Conversation)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.SharedTask)
            .WithMany()
            .HasForeignKey(m => m.SharedTaskId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.SharedProject)
            .WithMany()
            .HasForeignKey(m => m.SharedProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.ConvertedToTask)
            .WithMany()
            .HasForeignKey(m => m.ConvertedToTaskId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
