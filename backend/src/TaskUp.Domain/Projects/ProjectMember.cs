using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Projects;

public enum ProjectRole
{
    Owner,
    Member,
}

public class ProjectMember
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public ProjectRole Role { get; set; } = ProjectRole.Member;

    public Guid? InvitedById { get; set; }
    public User? InvitedBy { get; set; }

    public DateTimeOffset JoinedAt { get; set; }
}
