using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Identity;

namespace TaskUp.Infrastructure.Persistence.Configurations.Identity;

public class OtpRequestConfiguration : IEntityTypeConfiguration<OtpRequest>
{
    public void Configure(EntityTypeBuilder<OtpRequest> builder)
    {
        builder.Ignore(o => o.IsValid);

        builder.Property(o => o.Phone).HasMaxLength(20).IsRequired();
        builder.Property(o => o.CodeHash).HasMaxLength(500).IsRequired();

        builder.HasIndex(o => o.Phone);
    }
}
