using TaskUp.Domain.Projects;

namespace TaskUp.Application.Authorization;

/// <summary>
/// Pure implementation of the Project side of the D7 permission matrix
/// (final-domain-model.md §11). Authority comes entirely from the caller's
/// <see cref="ProjectMember.Role"/> row — no separate roles/permissions table.
/// </summary>
public static class ProjectPermissionPolicy
{
    public static bool HasPermission(ProjectAccessContext context, ProjectPermission permission)
    {
        return permission switch
        {
            ProjectPermission.View => context.RequesterRole is not null,
            ProjectPermission.CreateTask => context.RequesterRole is not null,
            ProjectPermission.EditSettings => context.RequesterRole == ProjectRole.Owner,
            ProjectPermission.ManageMembers => context.RequesterRole == ProjectRole.Owner,
            ProjectPermission.Delete => context.RequesterRole == ProjectRole.Owner,
            _ => false,
        };
    }
}
