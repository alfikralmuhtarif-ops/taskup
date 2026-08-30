using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Shared;

namespace TaskUp.Infrastructure.Persistence.Configurations.Shared;

public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.Property(a => a.FileName).HasMaxLength(500).IsRequired();
        builder.Property(a => a.MimeType).HasMaxLength(200).IsRequired();
        builder.Property(a => a.StorageUrl).HasMaxLength(2000).IsRequired();

        builder.HasIndex(a => new { a.OwnerType, a.OwnerId });

        builder.HasOne(a => a.Uploader)
            .WithMany()
            .HasForeignKey(a => a.UploaderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
