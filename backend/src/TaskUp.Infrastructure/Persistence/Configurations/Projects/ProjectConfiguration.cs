using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Projects;

namespace TaskUp.Infrastructure.Persistence.Configurations.Projects;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(2000);
        builder.Property(p => p.Color).HasMaxLength(10).IsRequired();

        builder.HasIndex(p => p.CreatedById);

        builder.HasOne(p => p.CreatedBy)
            .WithMany()
            .HasForeignKey(p => p.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Soft-delete (final-domain-model.md §12.2): excluded from default queries,
        // still reachable via IgnoreQueryFilters() for fetch-by-id.
        builder.HasQueryFilter(p => p.DeletedAt == null);
    }
}
