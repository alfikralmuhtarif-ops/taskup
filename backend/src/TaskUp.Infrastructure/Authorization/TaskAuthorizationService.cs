using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Authorization;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Authorization;

public class TaskAuthorizationService(TaskUpDbContext db) : ITaskAuthorizationService
{
    public async Task<bool> UserCanAsync(Guid userId, Guid taskId, TaskPermission permission, CancellationToken cancellationToken = default)
    {
        var context = await LoadContextAsync(userId, taskId, cancellationToken);
        return context is not null && TaskPermissionPolicy.HasPermission(context, userId, permission);
    }

    public async Task EnsureUserCanAsync(Guid userId, Guid taskId, TaskPermission permission, CancellationToken cancellationToken = default)
    {
        if (!await UserCanAsync(userId, taskId, permission, cancellationToken))
        {
            throw new ForbiddenException();
        }
    }

    private async Task<TaskAccessContext?> LoadContextAsync(Guid userId, Guid taskId, CancellationToken cancellationToken)
    {
        var task = await db.Tasks
            .Where(t => t.Id == taskId)
            .Select(t => new
            {
                t.Id,
                t.CreatedById,
                t.OwnerId,
                t.ProjectId,
                ParticipantIds = t.Participants.Select(p => p.UserId).ToList(),
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (task is null)
        {
            return null;
        }

        var isProjectMember = task.ProjectId is not null
            && await db.ProjectMembers.AnyAsync(m => m.ProjectId == task.ProjectId && m.UserId == userId, cancellationToken);

        return new TaskAccessContext(task.Id, task.CreatedById, task.OwnerId, task.ParticipantIds, isProjectMember);
    }
}
