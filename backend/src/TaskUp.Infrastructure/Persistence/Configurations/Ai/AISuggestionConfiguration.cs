using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Ai;

namespace TaskUp.Infrastructure.Persistence.Configurations.Ai;

public class AISuggestionConfiguration : IEntityTypeConfiguration<AISuggestion>
{
    public void Configure(EntityTypeBuilder<AISuggestion> builder)
    {
        builder.Property(s => s.Content).HasMaxLength(2000).IsRequired();

        builder.HasIndex(s => s.TaskId);

        builder.HasOne(s => s.Task)
            .WithMany()
            .HasForeignKey(s => s.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.AcceptedChecklistItem)
            .WithMany()
            .HasForeignKey(s => s.AcceptedChecklistItemId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
