using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Authorization;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Authorization;

public class ProjectAuthorizationService(TaskUpDbContext db) : IProjectAuthorizationService
{
    public async Task<bool> UserCanAsync(Guid userId, Guid projectId, ProjectPermission permission, CancellationToken cancellationToken = default)
    {
        var context = await LoadContextAsync(userId, projectId, cancellationToken);
        return context is not null && ProjectPermissionPolicy.HasPermission(context, permission);
    }

    public async Task EnsureUserCanAsync(Guid userId, Guid projectId, ProjectPermission permission, CancellationToken cancellationToken = default)
    {
        if (!await UserCanAsync(userId, projectId, permission, cancellationToken))
        {
            throw new ForbiddenException();
        }
    }

    private async Task<ProjectAccessContext?> LoadContextAsync(Guid userId, Guid projectId, CancellationToken cancellationToken)
    {
        var project = await db.Projects
            .Where(p => p.Id == projectId)
            .Select(p => new { p.Id, p.CreatedById })
            .FirstOrDefaultAsync(cancellationToken);

        if (project is null)
        {
            return null;
        }

        var role = await db.ProjectMembers
            .Where(m => m.ProjectId == projectId && m.UserId == userId)
            .Select(m => (Domain.Projects.ProjectRole?)m.Role)
            .FirstOrDefaultAsync(cancellationToken);

        return new ProjectAccessContext(project.Id, project.CreatedById, role);
    }
}
