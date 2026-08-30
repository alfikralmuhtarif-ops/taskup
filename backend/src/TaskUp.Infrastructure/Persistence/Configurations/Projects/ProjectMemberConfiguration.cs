using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskUp.Domain.Projects;

namespace TaskUp.Infrastructure.Persistence.Configurations.Projects;

public class ProjectMemberConfiguration : IEntityTypeConfiguration<ProjectMember>
{
    public void Configure(EntityTypeBuilder<ProjectMember> builder)
    {
        builder.HasIndex(pm => new { pm.ProjectId, pm.UserId }).IsUnique();

        builder.HasOne(pm => pm.Project)
            .WithMany(p => p.Members)
            .HasForeignKey(pm => pm.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pm => pm.User)
            .WithMany()
            .HasForeignKey(pm => pm.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pm => pm.InvitedBy)
            .WithMany()
            .HasForeignKey(pm => pm.InvitedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
