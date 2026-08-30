using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Identity;

namespace TaskUp.Infrastructure.Persistence.Configurations.Identity;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // No HasMaxLength: the stored value is AES-GCM ciphertext (base64, larger than the
        // plaintext phone number), converted transparently in TaskUpDbContext.OnModelCreating.
        builder.Property(u => u.Phone).IsRequired();

        builder.Property(u => u.PhoneHash).HasMaxLength(64).IsRequired();
        builder.HasIndex(u => u.PhoneHash).IsUnique();

        builder.Property(u => u.Name).HasMaxLength(200).IsRequired();
        builder.Property(u => u.AvatarUrl).HasMaxLength(1000);
    }
}
