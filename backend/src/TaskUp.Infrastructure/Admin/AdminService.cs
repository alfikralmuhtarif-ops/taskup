using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Admin;
using TaskUp.Application.Admin.Dtos;
using TaskUp.Application.Common;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Domain.Admin;
using TaskUp.Domain.Identity;
using TaskUp.Domain.Projects;
using TaskUp.Domain.Tasks;
using TaskUp.Infrastructure.Identity;
using TaskUp.Infrastructure.Persistence;
using DomainTaskStatus = TaskUp.Domain.Tasks.TaskStatus;

namespace TaskUp.Infrastructure.Admin;

public class AdminService(TaskUpDbContext db, AdminBootstrapOptions bootstrapOptions, IFieldEncryptionService fieldEncryption) : IAdminService
{
    public async Task<bool> BootstrapAdminAsync(BootstrapAdminRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(bootstrapOptions.Secret) || request.Secret != bootstrapOptions.Secret)
        {
            throw new UnauthorizedAppException("Invalid bootstrap secret.");
        }

        var phoneHash = fieldEncryption.Hash(request.Phone);
        var user = await db.Users.FirstOrDefaultAsync(u => u.PhoneHash == phoneHash, cancellationToken)
            ?? throw new NotFoundException("User", request.Phone);

        user.IsSystemAdmin = true;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken cancellationToken = default)
    {
        var weekAgo = DateTimeOffset.UtcNow.AddDays(-7);
        var now = DateTimeOffset.UtcNow;

        var totalUsers = await db.Users.CountAsync(cancellationToken);
        var newUsersThisWeek = await db.Users.CountAsync(u => u.CreatedAt >= weekAgo, cancellationToken);
        var totalProjects = await db.Projects.CountAsync(cancellationToken);
        var totalTasks = await db.Tasks.CountAsync(cancellationToken);
        var notStarted = await db.Tasks.CountAsync(t => t.Status == DomainTaskStatus.NotStarted, cancellationToken);
        var inProgress = await db.Tasks.CountAsync(t => t.Status == DomainTaskStatus.InProgress, cancellationToken);
        var done = await db.Tasks.CountAsync(t => t.Status == DomainTaskStatus.Done, cancellationToken);
        var overdue = await db.Tasks.CountAsync(t => t.DueDate != null && t.DueDate < now && t.Status != DomainTaskStatus.Done, cancellationToken);
        var newTasksThisWeek = await db.Tasks.CountAsync(t => t.CreatedAt >= weekAgo, cancellationToken);
        var totalMessages = await db.Messages.CountAsync(cancellationToken);

        return new DashboardStatsDto(
            totalUsers, newUsersThisWeek, totalProjects, totalTasks,
            notStarted, inProgress, done, overdue, newTasksThisWeek, totalMessages);
    }

    public async Task<PagedResult<AdminUserListItemDto>> ListUsersAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 20 : pageSize;

        var query = db.Users.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var trimmed = search.Trim();
            var pattern = $"%{trimmed}%";
            // Phone is encrypted at rest (AES-GCM, non-deterministic), so it can no longer be
            // ILIKE-matched — only an exact match against PhoneHash works. Name search is unaffected.
            if (trimmed.Length > 3 && trimmed.All(c => char.IsDigit(c) || c == '+'))
            {
                var phoneHash = fieldEncryption.Hash(trimmed);
                query = query.Where(u => EF.Functions.ILike(u.Name, pattern) || u.PhoneHash == phoneHash);
            }
            else
            {
                query = query.Where(u => EF.Functions.ILike(u.Name, pattern));
            }
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserListItemDto(u.Id, u.Phone, u.Name, u.IsDisabled, u.IsSystemAdmin, u.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<AdminUserListItemDto>(items, page, pageSize, total);
    }

    public async Task<AdminUserDetailDto> GetUserAsync(Guid userId, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), userId);

        await LogAccessAsync(AdminAccessResourceType.User, userId, adminUserId, cancellationToken);
        return await BuildUserDetailAsync(user, cancellationToken);
    }

    public async Task<AdminUserDetailDto> SetUserDisabledAsync(Guid userId, bool isDisabled, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), userId);

        // The bootstrap endpoint remains a valid recovery path even if every admin were
        // disabled, but blocking this here avoids the operational dead-end in the first
        // place — a mis-click that locks out the only person who can undo it.
        if (isDisabled && user.IsSystemAdmin)
        {
            var activeAdminCount = await db.Users.CountAsync(u => u.IsSystemAdmin && !u.IsDisabled, cancellationToken);
            if (activeAdminCount <= 1)
            {
                throw new ValidationAppException(new Dictionary<string, string[]>
                {
                    ["isDisabled"] = ["Can't disable the last remaining active system admin."],
                });
            }
        }

        user.IsDisabled = isDisabled;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return await BuildUserDetailAsync(user, cancellationToken);
    }

    public async Task<IReadOnlyList<AdminUserTaskDto>> GetUserTasksAsync(Guid userId, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        await LogAccessAsync(AdminAccessResourceType.User, userId, adminUserId, cancellationToken);

        var rows = await db.Tasks
            .Where(t => t.CreatedById == userId || t.OwnerId == userId || t.Participants.Any(p => p.UserId == userId))
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.Id,
                t.Title,
                t.Status,
                t.DueDate,
                IsCreator = t.CreatedById == userId,
                IsOwner = t.OwnerId == userId,
            })
            .ToListAsync(cancellationToken);

        return rows
            .Select(t => new AdminUserTaskDto(
                t.Id, t.Title, t.Status.ToString(),
                t.IsCreator ? "Creator" : t.IsOwner ? "Owner" : "Participant",
                t.DueDate))
            .ToList();
    }

    public async Task<IReadOnlyList<AdminUserProjectDto>> GetUserProjectsAsync(Guid userId, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        await LogAccessAsync(AdminAccessResourceType.User, userId, adminUserId, cancellationToken);

        return await db.ProjectMembers
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.JoinedAt)
            .Select(m => new AdminUserProjectDto(m.ProjectId, m.Project.Name, m.Project.Status.ToString(), m.Role.ToString()))
            .ToListAsync(cancellationToken);
    }

    public async Task<PagedResult<AdminTaskListItemDto>> ListTasksAsync(AdminTaskListQuery query, CancellationToken cancellationToken = default)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 or > 100 ? 20 : query.PageSize;

        var tasks = query.IncludeDeleted ? db.Tasks.IgnoreQueryFilters() : db.Tasks.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            tasks = tasks.Where(t => EF.Functions.ILike(t.Title, pattern));
        }

        if (query.ProjectId is not null)
        {
            tasks = tasks.Where(t => t.ProjectId == query.ProjectId);
        }

        if (query.Status is not null && Enum.TryParse<DomainTaskStatus>(query.Status, true, out var status))
        {
            tasks = tasks.Where(t => t.Status == status);
        }

        var total = await tasks.CountAsync(cancellationToken);
        var items = await tasks
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new AdminTaskListItemDto(
                t.Id, t.Title, t.Status.ToString(), t.ProjectId, t.Project != null ? t.Project.Name : null,
                t.OwnerId, t.Owner != null ? t.Owner.Name : null, t.CreatedById, t.CreatedBy.Name,
                t.DueDate, t.DeletedAt != null, t.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<AdminTaskListItemDto>(items, page, pageSize, total);
    }

    public async Task<AdminTaskDetailDto> GetTaskAsync(Guid taskId, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        var task = await db.Tasks.IgnoreQueryFilters()
            .Where(t => t.Id == taskId)
            .Select(t => new
            {
                t.Id,
                t.Title,
                t.Description,
                t.Status,
                t.ProjectId,
                ProjectName = t.Project != null ? t.Project.Name : null,
                t.CreatedById,
                CreatedByName = t.CreatedBy.Name,
                t.OwnerId,
                OwnerName = t.Owner != null ? t.Owner.Name : null,
                t.DueDate,
                t.CreatedAt,
                t.CompletedAt,
                IsDeleted = t.DeletedAt != null,
            })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        await LogAccessAsync(AdminAccessResourceType.Task, taskId, adminUserId, cancellationToken);

        var checklist = await db.TaskChecklistItems
            .Where(c => c.TaskId == taskId)
            .OrderBy(c => c.SortOrder)
            .Select(c => new AdminChecklistItemDto(c.Id, c.Title, c.IsCompleted, c.SortOrder))
            .ToListAsync(cancellationToken);

        var participants = await db.TaskParticipants
            .Where(p => p.TaskId == taskId)
            .Select(p => new AdminTaskParticipantDto(p.UserId, p.User.Name, p.User.Phone))
            .ToListAsync(cancellationToken);

        var updates = await db.TaskUpdates
            .Where(u => u.TaskId == taskId)
            .OrderByDescending(u => u.CreatedAt)
            .Take(50)
            .Select(u => new AdminTaskUpdateItemDto(u.Id, u.AuthorId, u.Author.Name, u.Type.ToString(), u.Text, u.CreatedAt))
            .ToListAsync(cancellationToken);

        var activities = await db.TaskActivities
            .Where(a => a.TaskId == taskId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(50)
            .Select(a => new AdminTaskActivityDto(a.Id, a.ActorId, a.Actor != null ? a.Actor.Name : null, a.Type.ToString(), a.Metadata, a.CreatedAt))
            .ToListAsync(cancellationToken);

        return new AdminTaskDetailDto(
            task.Id, task.Title, task.Description, task.Status.ToString(), task.ProjectId, task.ProjectName,
            task.CreatedById, task.CreatedByName, task.OwnerId, task.OwnerName, task.DueDate, task.CreatedAt,
            task.CompletedAt, task.IsDeleted, checklist, participants, updates, activities);
    }

    public async Task DeleteTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        var now = DateTimeOffset.UtcNow;
        task.DeletedAt = now;
        task.UpdatedAt = now;

        db.TaskActivities.Add(new TaskActivity { Id = Guid.NewGuid(), TaskId = taskId, ActorId = null, Type = TaskActivityType.Deleted, CreatedAt = now });

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task RestoreTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var task = await db.Tasks.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        task.DeletedAt = null;
        task.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<PagedResult<AdminProjectListItemDto>> ListProjectsAsync(AdminProjectListQuery query, CancellationToken cancellationToken = default)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 or > 100 ? 20 : query.PageSize;

        var projects = query.IncludeDeleted ? db.Projects.IgnoreQueryFilters() : db.Projects.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            projects = projects.Where(p => EF.Functions.ILike(p.Name, pattern));
        }

        var total = await projects.CountAsync(cancellationToken);
        var items = await projects
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new AdminProjectListItemDto(
                p.Id, p.Name, p.Status.ToString(), p.CreatedById, p.CreatedBy.Name,
                p.Members.Count, p.Tasks.Count, p.DeletedAt != null, p.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<AdminProjectListItemDto>(items, page, pageSize, total);
    }

    public async Task<AdminProjectDetailDto> GetProjectAsync(Guid projectId, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        var project = await db.Projects.IgnoreQueryFilters()
            .Where(p => p.Id == projectId)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                p.Color,
                p.Status,
                p.CreatedById,
                CreatedByName = p.CreatedBy.Name,
                p.CreatedAt,
                IsDeleted = p.DeletedAt != null,
            })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(nameof(Project), projectId);

        await LogAccessAsync(AdminAccessResourceType.Project, projectId, adminUserId, cancellationToken);

        var members = await db.ProjectMembers
            .Where(m => m.ProjectId == projectId)
            .Select(m => new AdminProjectMemberDto(m.UserId, m.User.Name, m.User.Phone, m.Role.ToString()))
            .ToListAsync(cancellationToken);

        var tasks = await db.Tasks.IgnoreQueryFilters()
            .Where(t => t.ProjectId == projectId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new AdminTaskListItemDto(
                t.Id, t.Title, t.Status.ToString(), t.ProjectId, project.Name,
                t.OwnerId, t.Owner != null ? t.Owner.Name : null, t.CreatedById, t.CreatedBy.Name,
                t.DueDate, t.DeletedAt != null, t.CreatedAt))
            .ToListAsync(cancellationToken);

        return new AdminProjectDetailDto(
            project.Id, project.Name, project.Description, project.Color, project.Status.ToString(),
            project.CreatedById, project.CreatedByName, project.CreatedAt, project.IsDeleted, members, tasks);
    }

    public async Task DeleteProjectAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken)
            ?? throw new NotFoundException(nameof(Project), projectId);

        var now = DateTimeOffset.UtcNow;
        project.DeletedAt = now;
        project.UpdatedAt = now;
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task RestoreProjectAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var project = await db.Projects.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken)
            ?? throw new NotFoundException(nameof(Project), projectId);

        project.DeletedAt = null;
        project.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ActivityFeedItemDto>> GetRecentActivityAsync(int limit, CancellationToken cancellationToken = default)
    {
        limit = limit is < 1 or > 100 ? 20 : limit;

        var newUsers = await db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Take(limit)
            .Select(u => new ActivityFeedItemDto(u.Id, "UserRegistered", u.Name != "" ? u.Name : u.Phone, "مستخدم جديد", u.CreatedAt))
            .ToListAsync(cancellationToken);

        var newTasks = await db.Tasks
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .Select(t => new ActivityFeedItemDto(t.Id, "TaskCreated", t.Title, $"مهمة جديدة بواسطة {t.CreatedBy.Name}", t.CreatedAt))
            .ToListAsync(cancellationToken);

        var newProjects = await db.Projects
            .OrderByDescending(p => p.CreatedAt)
            .Take(limit)
            .Select(p => new ActivityFeedItemDto(p.Id, "ProjectCreated", p.Name, $"مشروع جديد بواسطة {p.CreatedBy.Name}", p.CreatedAt))
            .ToListAsync(cancellationToken);

        return newUsers.Concat(newTasks).Concat(newProjects)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .ToList();
    }

    public async Task<PagedResult<AdminReportListItemDto>> ListReportsAsync(bool includeResolved, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 20 : pageSize;

        var query = db.UserReports.AsQueryable();
        if (!includeResolved)
        {
            query = query.Where(r => r.Status == UserReportStatus.Open);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AdminReportListItemDto(
                r.Id, r.ReporterId, r.Reporter.Name, r.ReportedUserId, r.ReportedUser.Name,
                r.Reason, r.MessageId, r.Status.ToString(), r.CreatedAt, r.ResolvedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<AdminReportListItemDto>(items, page, pageSize, total);
    }

    public async Task ResolveReportAsync(Guid reportId, CancellationToken cancellationToken = default)
    {
        var report = await db.UserReports.FirstOrDefaultAsync(r => r.Id == reportId, cancellationToken)
            ?? throw new NotFoundException(nameof(UserReport), reportId);

        report.Status = UserReportStatus.Resolved;
        report.ResolvedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task ReopenReportAsync(Guid reportId, CancellationToken cancellationToken = default)
    {
        var report = await db.UserReports.FirstOrDefaultAsync(r => r.Id == reportId, cancellationToken)
            ?? throw new NotFoundException(nameof(UserReport), reportId);

        report.Status = UserReportStatus.Open;
        report.ResolvedAt = null;
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<PagedResult<AdminAccessLogItemDto>> ListAccessLogAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 20 : pageSize;

        var total = await db.AdminAccessLogs.CountAsync(cancellationToken);
        var items = await db.AdminAccessLogs
            .OrderByDescending(l => l.AccessedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new AdminAccessLogItemDto(l.Id, l.AdminUserId, l.AdminUser.Name, l.ResourceType.ToString(), l.ResourceId, l.AccessedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<AdminAccessLogItemDto>(items, page, pageSize, total);
    }

    private async Task LogAccessAsync(AdminAccessResourceType resourceType, Guid resourceId, Guid adminUserId, CancellationToken cancellationToken)
    {
        db.AdminAccessLogs.Add(new AdminAccessLog
        {
            Id = Guid.NewGuid(),
            AdminUserId = adminUserId,
            ResourceType = resourceType,
            ResourceId = resourceId,
            AccessedAt = DateTimeOffset.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task<AdminUserDetailDto> BuildUserDetailAsync(User user, CancellationToken cancellationToken)
    {
        var taskCount = await db.Tasks.CountAsync(t => t.CreatedById == user.Id || t.OwnerId == user.Id, cancellationToken);
        var projectCount = await db.Projects.CountAsync(p => p.Members.Any(m => m.UserId == user.Id), cancellationToken);
        var messageCount = await db.Messages.CountAsync(m => m.SenderId == user.Id, cancellationToken);

        return new AdminUserDetailDto(
            user.Id, user.Phone, user.Name, user.AvatarUrl, user.IsDisabled, user.IsSystemAdmin,
            user.CreatedAt, taskCount, projectCount, messageCount);
    }
}
