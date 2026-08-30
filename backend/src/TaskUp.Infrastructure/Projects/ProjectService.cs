using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Authorization;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Application.Projects;
using TaskUp.Application.Projects.Dtos;
using TaskUp.Application.Tasks.Dtos;
using TaskUp.Domain.Invites;
using TaskUp.Domain.Projects;
using TaskUp.Domain.Tasks;
using TaskUp.Infrastructure.Persistence;
using DomainTaskStatus = TaskUp.Domain.Tasks.TaskStatus;

namespace TaskUp.Infrastructure.Projects;

public class ProjectService(TaskUpDbContext db, IProjectAuthorizationService projectAuth) : IProjectService
{
    public async Task<IReadOnlyList<ProjectDto>> ListAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var rows = await db.Projects
            .Where(p => p.Members.Any(m => m.UserId == userId))
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                p.Color,
                p.Status,
                p.CreatedAt,
                TotalTasks = p.Tasks.Count,
                DoneTasks = p.Tasks.Count(t => t.Status == DomainTaskStatus.Done),
                MemberCount = p.Members.Count,
            })
            .ToListAsync(cancellationToken);

        return rows.Select(p => new ProjectDto(
            p.Id, p.Name, p.Description, p.Color, p.Status.ToString(),
            Project.ComputeProgress(p.TotalTasks, p.DoneTasks), p.TotalTasks, p.MemberCount, p.CreatedAt))
            .ToList();
    }

    public async Task<ProjectDetailDto> GetAsync(Guid userId, Guid projectId, CancellationToken cancellationToken = default)
    {
        await projectAuth.EnsureUserCanAsync(userId, projectId, ProjectPermission.View, cancellationToken);
        return await BuildDetailAsync(projectId, cancellationToken);
    }

    public async Task<ProjectDetailDto> CreateAsync(Guid userId, CreateProjectRequest request, CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Color = request.Color,
            CreatedById = userId,
            Status = ProjectStatus.Active,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.Projects.Add(project);

        db.ProjectMembers.Add(new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            UserId = userId,
            Role = ProjectRole.Owner,
            JoinedAt = now,
        });

        await AddMembersInternalAsync(project.Id, userId, request.MemberIds, request.ExternalInvites, now, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
        return await BuildDetailAsync(project.Id, cancellationToken);
    }

    public async Task<ProjectDetailDto> UpdateAsync(Guid userId, Guid projectId, UpdateProjectRequest request, CancellationToken cancellationToken = default)
    {
        await projectAuth.EnsureUserCanAsync(userId, projectId, ProjectPermission.EditSettings, cancellationToken);

        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken)
            ?? throw new NotFoundException(nameof(Project), projectId);

        if (request.Name is not null) project.Name = request.Name;
        if (request.Description is not null) project.Description = request.Description;
        if (request.Color is not null) project.Color = request.Color;
        project.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return await BuildDetailAsync(projectId, cancellationToken);
    }

    public async Task DeleteAsync(Guid userId, Guid projectId, CancellationToken cancellationToken = default)
    {
        await projectAuth.EnsureUserCanAsync(userId, projectId, ProjectPermission.Delete, cancellationToken);

        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken)
            ?? throw new NotFoundException(nameof(Project), projectId);

        var now = DateTimeOffset.UtcNow;
        project.DeletedAt = now;
        project.UpdatedAt = now;

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TaskListItemDto>> GetTasksAsync(Guid userId, Guid projectId, CancellationToken cancellationToken = default)
    {
        await projectAuth.EnsureUserCanAsync(userId, projectId, ProjectPermission.View, cancellationToken);

        var rows = await db.Tasks
            .Where(t => t.ProjectId == projectId)
            .OrderBy(t => t.DueDate == null).ThenBy(t => t.DueDate)
            .Select(t => new
            {
                t.Id,
                t.Title,
                t.Status,
                t.ProjectId,
                ProjectName = t.Project!.Name,
                t.OwnerId,
                OwnerName = t.Owner != null ? t.Owner.Name : null,
                t.DueDate,
                TotalChecklist = t.ChecklistItems.Count,
                CompletedChecklist = t.ChecklistItems.Count(c => c.IsCompleted),
            })
            .ToListAsync(cancellationToken);

        return rows.Select(t => new TaskListItemDto(
            t.Id, t.Title, t.Status.ToString(), t.ProjectId, t.ProjectName, t.OwnerId, t.OwnerName, t.DueDate,
            t.DueDate is not null && t.DueDate < DateTimeOffset.UtcNow && t.Status != DomainTaskStatus.Done,
            TaskItem.ComputeProgress(t.TotalChecklist, t.CompletedChecklist)))
            .ToList();
    }

    public async Task AddMembersAsync(Guid userId, Guid projectId, AddMembersRequest request, CancellationToken cancellationToken = default)
    {
        await projectAuth.EnsureUserCanAsync(userId, projectId, ProjectPermission.ManageMembers, cancellationToken);
        await AddMembersInternalAsync(projectId, userId, request.UserIds, request.ExternalInvites, DateTimeOffset.UtcNow, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveMemberAsync(Guid userId, Guid projectId, Guid memberUserId, CancellationToken cancellationToken = default)
    {
        await projectAuth.EnsureUserCanAsync(userId, projectId, ProjectPermission.ManageMembers, cancellationToken);

        var member = await db.ProjectMembers
            .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == memberUserId, cancellationToken);

        if (member is null)
        {
            return;
        }

        db.ProjectMembers.Remove(member);
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task AddMembersInternalAsync(
        Guid projectId, Guid actingUserId, IReadOnlyList<Guid>? userIds, IReadOnlyList<string>? externalInvites,
        DateTimeOffset now, CancellationToken cancellationToken)
    {
        if (userIds is { Count: > 0 })
        {
            var existing = await db.ProjectMembers
                .Where(m => m.ProjectId == projectId && userIds.Contains(m.UserId))
                .Select(m => m.UserId)
                .ToListAsync(cancellationToken);

            foreach (var memberUserId in userIds.Distinct().Except(existing))
            {
                db.ProjectMembers.Add(new ProjectMember
                {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    UserId = memberUserId,
                    Role = ProjectRole.Member,
                    InvitedById = actingUserId,
                    JoinedAt = now,
                });
            }
        }

        if (externalInvites is { Count: > 0 })
        {
            foreach (var phone in externalInvites.Distinct())
            {
                db.Invites.Add(new Invite
                {
                    Id = Guid.NewGuid(),
                    InviterId = actingUserId,
                    Phone = phone,
                    ContextType = InviteContextType.Project,
                    ContextId = projectId,
                    Status = InviteStatus.Pending,
                    SentAt = now,
                });
            }
        }
    }

    private async Task<ProjectDetailDto> BuildDetailAsync(Guid projectId, CancellationToken cancellationToken)
    {
        var project = await db.Projects
            .Where(p => p.Id == projectId)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                p.Color,
                p.Status,
                p.CreatedAt,
                TotalTasks = p.Tasks.Count,
                DoneTasks = p.Tasks.Count(t => t.Status == DomainTaskStatus.Done),
                Members = p.Members.Select(m => new ProjectMemberDto(m.UserId, m.User.Name, m.User.AvatarUrl, m.Role.ToString())).ToList(),
            })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(nameof(Project), projectId);

        return new ProjectDetailDto(
            project.Id, project.Name, project.Description, project.Color, project.Status.ToString(),
            Project.ComputeProgress(project.TotalTasks, project.DoneTasks), project.TotalTasks, project.CreatedAt, project.Members);
    }
}
