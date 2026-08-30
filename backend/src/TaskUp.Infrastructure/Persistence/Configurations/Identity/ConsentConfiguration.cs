using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Identity;

namespace TaskUp.Infrastructure.Persistence.Configurations.Identity;

public class ConsentConfiguration : IEntityTypeConfiguration<Consent>
{
    public void Configure(EntityTypeBuilder<Consent> builder)
    {
        builder.Property(c => c.TermsVersion).HasMaxLength(50).IsRequired();
        builder.Property(c => c.PrivacyVersion).HasMaxLength(50).IsRequired();

        builder.HasIndex(c => c.UserId);

        builder.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
