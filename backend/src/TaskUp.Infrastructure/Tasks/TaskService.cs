using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Authorization;
using TaskUp.Application.Common;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Application.Notifications;
using TaskUp.Application.Tasks;
using TaskUp.Application.Tasks.Dtos;
using TaskUp.Domain.Invites;
using TaskUp.Domain.Notifications;
using TaskUp.Domain.Shared;
using TaskUp.Domain.Tasks;
using TaskUp.Infrastructure.Persistence;
using DomainTaskStatus = TaskUp.Domain.Tasks.TaskStatus;

namespace TaskUp.Infrastructure.Tasks;

public class TaskService(
    TaskUpDbContext db,
    ITaskAuthorizationService taskAuth,
    IProjectAuthorizationService projectAuth,
    INotificationPublisher notificationPublisher) : ITaskService
{
    public async Task<IReadOnlyList<TaskListItemDto>> ListAsync(Guid userId, TaskListQuery query, CancellationToken cancellationToken = default)
    {
        var visible = db.Tasks.Where(t =>
            t.CreatedById == userId ||
            t.OwnerId == userId ||
            t.Participants.Any(p => p.UserId == userId) ||
            (t.ProjectId != null && t.Project!.Members.Any(m => m.UserId == userId)));

        if (query.ProjectId is not null)
        {
            visible = visible.Where(t => t.ProjectId == query.ProjectId);
        }

        if (query.Status is not null && Enum.TryParse<DomainTaskStatus>(query.Status, true, out var status))
        {
            visible = visible.Where(t => t.Status == status);
        }

        var now = DateTimeOffset.UtcNow;
        // DateTimeOffset.Date returns a bare DateTime (Kind=Unspecified), so the naive
        // `now.Date` implicitly converts back to DateTimeOffset via the *local* system
        // timezone (not UTC) — on a UTC+3 machine this produces a +03:00 offset, which
        // Npgsql then rejects for "timestamp with time zone" columns (UTC-only). Going
        // through UtcDateTime keeps Kind=Utc so the implicit conversion stays at offset 0.
        var endOfToday = now.UtcDateTime.Date.AddDays(1).AddTicks(-1);

        visible = query.Section switch
        {
            "late" => visible.Where(t => t.OwnerId == userId && t.DueDate < now && t.Status != DomainTaskStatus.Done),
            "upcoming" => visible.Where(t => t.OwnerId == userId && t.DueDate > endOfToday && t.Status != DomainTaskStatus.Done),
            "now" => visible.Where(t => t.OwnerId == userId && t.Status != DomainTaskStatus.Done
                && (t.DueDate == null || t.DueDate <= endOfToday) && !(t.DueDate < now)),
            _ => visible,
        };

        var rows = await visible
            .OrderBy(t => t.DueDate == null).ThenBy(t => t.DueDate)
            .Select(t => new
            {
                t.Id,
                t.Title,
                t.Status,
                t.ProjectId,
                ProjectName = t.Project != null ? t.Project.Name : null,
                t.OwnerId,
                OwnerName = t.Owner != null ? t.Owner.Name : null,
                t.DueDate,
                TotalChecklist = t.ChecklistItems.Count,
                CompletedChecklist = t.ChecklistItems.Count(c => c.IsCompleted),
            })
            .ToListAsync(cancellationToken);

        return rows.Select(t => new TaskListItemDto(
            t.Id, t.Title, t.Status.ToString(), t.ProjectId, t.ProjectName, t.OwnerId, t.OwnerName,
            t.DueDate, IsOverdue(t.DueDate, t.Status), TaskItem.ComputeProgress(t.TotalChecklist, t.CompletedChecklist)))
            .ToList();
    }

    public async Task<TaskDetailDto> GetAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.View, cancellationToken);
        return await BuildDetailAsync(taskId, cancellationToken);
    }

    public async Task<TaskDetailDto> CreateAsync(Guid userId, CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        if (request.ProjectId is not null)
        {
            await projectAuth.EnsureUserCanAsync(userId, request.ProjectId.Value, ProjectPermission.CreateTask, cancellationToken);
        }

        var now = DateTimeOffset.UtcNow;
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = DomainTaskStatus.NotStarted,
            ProjectId = request.ProjectId,
            CreatedById = userId,
            OwnerId = request.OwnerId,
            DueDate = request.DueDate,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.Tasks.Add(task);

        db.TaskActivities.Add(new TaskActivity
        {
            Id = Guid.NewGuid(),
            TaskId = task.Id,
            ActorId = userId,
            Type = TaskActivityType.Created,
            CreatedAt = now,
        });

        await AddParticipantsInternalAsync(task.Id, userId, request.ParticipantIds, request.ExternalInvites, now, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);

        if (request.OwnerId is not null && request.OwnerId != userId)
        {
            await notificationPublisher.PublishAsync(
                request.OwnerId.Value, NotificationCategory.TaskAssigned,
                new NotificationText(NotificationTemplate.TaskAssigned), task.Title, nameof(TaskItem), task.Id, cancellationToken);
        }

        return await BuildDetailAsync(task.Id, cancellationToken);
    }

    public async Task<TaskDetailDto> UpdateAsync(Guid userId, Guid taskId, UpdateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        var now = DateTimeOffset.UtcNow;

        if (request.Title is not null || request.DueDate is not null || request.Description is not null)
        {
            await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.EditSettings, cancellationToken);
            if (request.Title is not null) task.Title = request.Title;
            if (request.DueDate is not null) task.DueDate = request.DueDate;
            if (request.Description is not null) task.Description = request.Description;
        }

        if (request.OwnerId is not null && request.OwnerId != task.OwnerId)
        {
            await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.ReassignOwner, cancellationToken);
            var previousOwnerId = task.OwnerId;
            task.OwnerId = request.OwnerId;

            db.TaskActivities.Add(new TaskActivity
            {
                Id = Guid.NewGuid(),
                TaskId = taskId,
                ActorId = userId,
                Type = TaskActivityType.OwnerChanged,
                Metadata = JsonSerializer.Serialize(new { previousOwnerId, newOwnerId = request.OwnerId }),
                CreatedAt = now,
            });
        }

        task.UpdatedAt = now;
        await db.SaveChangesAsync(cancellationToken);

        if (request.OwnerId is not null && request.OwnerId != userId)
        {
            await notificationPublisher.PublishAsync(
                request.OwnerId.Value, NotificationCategory.TaskAssigned,
                new NotificationText(NotificationTemplate.TaskAssigned), task.Title, nameof(TaskItem), task.Id, cancellationToken);
        }

        return await BuildDetailAsync(taskId, cancellationToken);
    }

    public async Task DeleteAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.Delete, cancellationToken);

        var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        var now = DateTimeOffset.UtcNow;
        task.DeletedAt = now;
        task.UpdatedAt = now;

        db.TaskActivities.Add(new TaskActivity
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            ActorId = userId,
            Type = TaskActivityType.Deleted,
            CreatedAt = now,
        });

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<TaskDetailDto> ChangeStatusAsync(Guid userId, Guid taskId, ChangeTaskStatusRequest request, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.ChangeStatus, cancellationToken);

        if (!Enum.TryParse<DomainTaskStatus>(request.Status, true, out var newStatus))
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                [nameof(request.Status)] = ["Must be 'NotStarted', 'InProgress' or 'Done'."],
            });
        }

        var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        var now = DateTimeOffset.UtcNow;
        var wasDone = task.Status == DomainTaskStatus.Done;
        task.Status = newStatus;
        task.UpdatedAt = now;

        if (newStatus == DomainTaskStatus.Done && !wasDone)
        {
            task.CompletedAt = now;
            task.CompletedById = userId;
            db.TaskActivities.Add(new TaskActivity { Id = Guid.NewGuid(), TaskId = taskId, ActorId = userId, Type = TaskActivityType.Completed, CreatedAt = now });
        }
        else if (newStatus != DomainTaskStatus.Done && wasDone)
        {
            task.CompletedAt = null;
            task.CompletedById = null;
            db.TaskActivities.Add(new TaskActivity { Id = Guid.NewGuid(), TaskId = taskId, ActorId = userId, Type = TaskActivityType.Reopened, CreatedAt = now });
        }
        else
        {
            db.TaskActivities.Add(new TaskActivity
            {
                Id = Guid.NewGuid(),
                TaskId = taskId,
                ActorId = userId,
                Type = TaskActivityType.StatusChanged,
                Metadata = JsonSerializer.Serialize(new { newStatus = newStatus.ToString() }),
                CreatedAt = now,
            });
        }

        await db.SaveChangesAsync(cancellationToken);
        return await BuildDetailAsync(taskId, cancellationToken);
    }

    public Task<TaskDetailDto> ReopenAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
        => ChangeStatusAsync(userId, taskId, new ChangeTaskStatusRequest(DomainTaskStatus.InProgress.ToString()), cancellationToken);

    public async Task AddParticipantsAsync(Guid userId, Guid taskId, AddParticipantsRequest request, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.ManageParticipants, cancellationToken);
        await AddParticipantsInternalAsync(taskId, userId, request.UserIds, request.ExternalInvites, DateTimeOffset.UtcNow, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveParticipantAsync(Guid userId, Guid taskId, Guid participantUserId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.ManageParticipants, cancellationToken);

        var participant = await db.TaskParticipants
            .FirstOrDefaultAsync(p => p.TaskId == taskId && p.UserId == participantUserId, cancellationToken);

        if (participant is null)
        {
            return;
        }

        db.TaskParticipants.Remove(participant);
        db.TaskActivities.Add(new TaskActivity
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            ActorId = userId,
            Type = TaskActivityType.ParticipantRemoved,
            Metadata = JsonSerializer.Serialize(new { userId = participantUserId }),
            CreatedAt = DateTimeOffset.UtcNow,
        });

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<PagedResult<TaskUpdateDto>> GetUpdatesAsync(Guid userId, Guid taskId, DateTimeOffset? before, int limit, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.View, cancellationToken);

        limit = limit is > 0 and <= 100 ? limit : 30;

        var query = db.TaskUpdates.Where(u => u.TaskId == taskId);
        if (before is not null)
        {
            query = query.Where(u => u.CreatedAt < before);
        }

        var totalCount = await db.TaskUpdates.CountAsync(u => u.TaskId == taskId, cancellationToken);

        var updates = await query
            .OrderByDescending(u => u.CreatedAt)
            .Take(limit)
            .Select(u => new
            {
                u.Id,
                u.AuthorId,
                AuthorName = u.Author.Name,
                AuthorAvatarUrl = u.Author.AvatarUrl,
                u.Type,
                u.Text,
                u.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        var updateIds = updates.Select(u => u.Id).ToList();
        var attachments = await db.Attachments
            .Where(a => a.OwnerType == AttachmentOwnerType.TaskUpdate && updateIds.Contains(a.OwnerId))
            .ToListAsync(cancellationToken);

        var items = updates.Select(u => new TaskUpdateDto(
            u.Id, u.AuthorId, u.AuthorName, u.AuthorAvatarUrl, u.Type.ToString(), u.Text, u.CreatedAt,
            attachments.Where(a => a.OwnerId == u.Id)
                .Select(a => new AttachmentDto(a.Id, a.FileName, a.FileSize, a.MimeType, a.StorageUrl))
                .ToList()))
            .ToList();

        return new PagedResult<TaskUpdateDto>(items, 1, limit, totalCount);
    }

    public async Task<TaskUpdateDto> AddUpdateAsync(Guid userId, Guid taskId, CreateTaskUpdateRequest request, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.AddUpdate, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var update = new TaskUpdate
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            AuthorId = userId,
            Type = request.FileId is not null ? TaskUpdateType.File : TaskUpdateType.Text,
            Text = request.Text,
            CreatedAt = now,
        };
        db.TaskUpdates.Add(update);

        if (request.FileId is not null)
        {
            var attachment = await db.Attachments.FirstOrDefaultAsync(a => a.Id == request.FileId, cancellationToken);
            if (attachment is not null)
            {
                if (attachment.UploaderId != userId)
                {
                    throw new ForbiddenException();
                }

                attachment.OwnerType = AttachmentOwnerType.TaskUpdate;
                attachment.OwnerId = update.Id;
            }
        }

        if (request.Mentions is { Count: > 0 })
        {
            foreach (var mentionedUserId in request.Mentions.Distinct())
            {
                db.Mentions.Add(new Mention
                {
                    Id = Guid.NewGuid(),
                    OwnerType = MentionOwnerType.TaskUpdate,
                    OwnerId = update.Id,
                    MentionedUserId = mentionedUserId,
                    CreatedAt = now,
                });
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        var author = await db.Users.Where(u => u.Id == userId).Select(u => new { u.Name, u.AvatarUrl }).FirstAsync(cancellationToken);
        var attachmentDtos = await db.Attachments
            .Where(a => a.OwnerType == AttachmentOwnerType.TaskUpdate && a.OwnerId == update.Id)
            .Select(a => new AttachmentDto(a.Id, a.FileName, a.FileSize, a.MimeType, a.StorageUrl))
            .ToListAsync(cancellationToken);

        var task = await db.Tasks.Where(t => t.Id == taskId).Select(t => new { t.Title, t.CreatedById, t.OwnerId }).FirstAsync(cancellationToken);

        if (request.Mentions is { Count: > 0 })
        {
            foreach (var mentionedUserId in request.Mentions.Distinct().Where(id => id != userId))
            {
                await notificationPublisher.PublishAsync(
                    mentionedUserId, NotificationCategory.Mention,
                    new NotificationText(NotificationTemplate.Mentioned, author.Name), task.Title, nameof(TaskItem), taskId, cancellationToken);
            }
        }

        foreach (var recipientId in new[] { task.CreatedById, task.OwnerId }.Where(id => id is not null && id != userId).Distinct())
        {
            await notificationPublisher.PublishAsync(
                recipientId!.Value, NotificationCategory.TaskUpdated,
                new NotificationText(NotificationTemplate.TaskUpdated, author.Name), task.Title, nameof(TaskItem), taskId, cancellationToken);
        }

        return new TaskUpdateDto(update.Id, userId, author.Name, author.AvatarUrl, update.Type.ToString(), update.Text, update.CreatedAt, attachmentDtos);
    }

    public async Task<TaskReportDto> GetReportAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.View, cancellationToken);

        var report = await db.Tasks
            .Where(t => t.Id == taskId)
            .Select(t => new
            {
                t.Title,
                t.Status,
                t.DueDate,
                TotalChecklist = t.ChecklistItems.Count,
                CompletedChecklist = t.ChecklistItems.Count(c => c.IsCompleted),
                UpdateCount = t.Updates.Count,
                LastUpdateAt = t.Updates.OrderByDescending(u => u.CreatedAt).Select(u => (DateTimeOffset?)u.CreatedAt).FirstOrDefault(),
            })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        return new TaskReportDto(
            taskId, report.Title, report.Status.ToString(),
            TaskItem.ComputeProgress(report.TotalChecklist, report.CompletedChecklist),
            report.TotalChecklist, report.CompletedChecklist, report.DueDate,
            IsOverdue(report.DueDate, report.Status), report.UpdateCount, report.LastUpdateAt);
    }

    public async Task<IReadOnlyList<ChecklistItemDto>> GetChecklistAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.View, cancellationToken);

        var items = await db.TaskChecklistItems
            .Where(c => c.TaskId == taskId)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);

        return items.Select(ToChecklistDto).ToList();
    }

    public async Task<ChecklistItemDto> AddChecklistItemAsync(Guid userId, Guid taskId, CreateChecklistItemRequest request, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.ManageChecklist, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var sortOrder = request.SortOrder ?? await db.TaskChecklistItems.Where(c => c.TaskId == taskId).CountAsync(cancellationToken);

        var item = new TaskChecklistItem
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            Title = request.Title,
            SortOrder = sortOrder,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.TaskChecklistItems.Add(item);

        db.TaskActivities.Add(new TaskActivity { Id = Guid.NewGuid(), TaskId = taskId, ActorId = userId, Type = TaskActivityType.ChecklistItemAdded, CreatedAt = now });

        await db.SaveChangesAsync(cancellationToken);
        return ToChecklistDto(item);
    }

    public async Task<ChecklistItemDto> UpdateChecklistItemAsync(Guid userId, Guid taskId, Guid itemId, UpdateChecklistItemRequest request, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.ManageChecklist, cancellationToken);

        var item = await GetChecklistItemOrThrowAsync(taskId, itemId, cancellationToken);
        if (request.Title is not null) item.Title = request.Title;
        if (request.SortOrder is not null) item.SortOrder = request.SortOrder.Value;
        item.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return ToChecklistDto(item);
    }

    public async Task<ChecklistItemDto> CompleteChecklistItemAsync(Guid userId, Guid taskId, Guid itemId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.ManageChecklist, cancellationToken);

        var item = await GetChecklistItemOrThrowAsync(taskId, itemId, cancellationToken);
        var now = DateTimeOffset.UtcNow;
        item.IsCompleted = true;
        item.CompletedById = userId;
        item.CompletedAt = now;
        item.UpdatedAt = now;

        db.TaskActivities.Add(new TaskActivity { Id = Guid.NewGuid(), TaskId = taskId, ActorId = userId, Type = TaskActivityType.ChecklistItemCompleted, CreatedAt = now });

        await db.SaveChangesAsync(cancellationToken);
        return ToChecklistDto(item);
    }

    public async Task<ChecklistItemDto> ReopenChecklistItemAsync(Guid userId, Guid taskId, Guid itemId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.ManageChecklist, cancellationToken);

        var item = await GetChecklistItemOrThrowAsync(taskId, itemId, cancellationToken);
        item.IsCompleted = false;
        item.CompletedById = null;
        item.CompletedAt = null;
        item.UpdatedAt = DateTimeOffset.UtcNow;

        db.TaskActivities.Add(new TaskActivity { Id = Guid.NewGuid(), TaskId = taskId, ActorId = userId, Type = TaskActivityType.ChecklistItemReopened, CreatedAt = DateTimeOffset.UtcNow });

        await db.SaveChangesAsync(cancellationToken);
        return ToChecklistDto(item);
    }

    public async Task DeleteChecklistItemAsync(Guid userId, Guid taskId, Guid itemId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.ManageChecklist, cancellationToken);

        var item = await GetChecklistItemOrThrowAsync(taskId, itemId, cancellationToken);
        db.TaskChecklistItems.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ActivityFeedItemDto>> GetTeamActivityAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var updates = await db.TaskUpdates
            .Where(u => u.AuthorId != userId && (
                u.Task.CreatedById == userId ||
                u.Task.OwnerId == userId ||
                u.Task.Participants.Any(p => p.UserId == userId) ||
                (u.Task.ProjectId != null && u.Task.Project!.Members.Any(m => m.UserId == userId))))
            .OrderByDescending(u => u.CreatedAt)
            .Take(50)
            .Select(u => new ActivityFeedItemDto(
                u.TaskId, u.Task.Title, u.AuthorId, u.Author.Name, u.Author.AvatarUrl, u.Text, u.CreatedAt))
            .ToListAsync(cancellationToken);

        return updates;
    }

    private async Task AddParticipantsInternalAsync(
        Guid taskId, Guid actingUserId, IReadOnlyList<Guid>? userIds, IReadOnlyList<string>? externalInvites,
        DateTimeOffset now, CancellationToken cancellationToken)
    {
        if (userIds is { Count: > 0 })
        {
            var existing = await db.TaskParticipants
                .Where(p => p.TaskId == taskId && userIds.Contains(p.UserId))
                .Select(p => p.UserId)
                .ToListAsync(cancellationToken);

            foreach (var participantUserId in userIds.Distinct().Except(existing))
            {
                db.TaskParticipants.Add(new TaskParticipant
                {
                    Id = Guid.NewGuid(),
                    TaskId = taskId,
                    UserId = participantUserId,
                    AddedById = actingUserId,
                    AddedAt = now,
                });

                db.TaskActivities.Add(new TaskActivity
                {
                    Id = Guid.NewGuid(),
                    TaskId = taskId,
                    ActorId = actingUserId,
                    Type = TaskActivityType.ParticipantAdded,
                    Metadata = JsonSerializer.Serialize(new { userId = participantUserId }),
                    CreatedAt = now,
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
                    ContextType = InviteContextType.Task,
                    ContextId = taskId,
                    Status = InviteStatus.Pending,
                    SentAt = now,
                });
            }
        }
    }

    private async Task<TaskDetailDto> BuildDetailAsync(Guid taskId, CancellationToken cancellationToken)
    {
        var task = await db.Tasks
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
                TotalChecklist = t.ChecklistItems.Count,
                CompletedChecklist = t.ChecklistItems.Count(c => c.IsCompleted),
                Participants = t.Participants.Select(p => new TaskParticipantDto(p.UserId, p.User.Name, p.User.AvatarUrl)).ToList(),
            })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        return new TaskDetailDto(
            task.Id, task.Title, task.Description, task.Status.ToString(), task.ProjectId, task.ProjectName,
            task.CreatedById, task.CreatedByName, task.OwnerId, task.OwnerName, task.DueDate,
            IsOverdue(task.DueDate, task.Status), TaskItem.ComputeProgress(task.TotalChecklist, task.CompletedChecklist),
            task.CreatedAt, task.CompletedAt, task.Participants);
    }

    private async Task<TaskChecklistItem> GetChecklistItemOrThrowAsync(Guid taskId, Guid itemId, CancellationToken cancellationToken)
        => await db.TaskChecklistItems.FirstOrDefaultAsync(c => c.Id == itemId && c.TaskId == taskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskChecklistItem), itemId);

    private static ChecklistItemDto ToChecklistDto(TaskChecklistItem item)
        => new(item.Id, item.Title, item.IsCompleted, item.SortOrder, item.CompletedById, item.CompletedAt);

    private static bool IsOverdue(DateTimeOffset? dueDate, DomainTaskStatus status)
        => dueDate is not null && dueDate < DateTimeOffset.UtcNow && status != DomainTaskStatus.Done;
}
