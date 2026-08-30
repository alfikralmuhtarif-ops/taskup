namespace TaskUp.Application.Admin.Dtos;

public record DashboardStatsDto(
    int TotalUsers,
    int NewUsersThisWeek,
    int TotalProjects,
    int TotalTasks,
    int TasksNotStarted,
    int TasksInProgress,
    int TasksDone,
    int TasksOverdue,
    int NewTasksThisWeek,
    int TotalMessages);

public record AdminUserListItemDto(
    Guid Id,
    string Phone,
    string Name,
    bool IsDisabled,
    bool IsSystemAdmin,
    DateTimeOffset CreatedAt);

public record AdminUserDetailDto(
    Guid Id,
    string Phone,
    string Name,
    string? AvatarUrl,
    bool IsDisabled,
    bool IsSystemAdmin,
    DateTimeOffset CreatedAt,
    int TaskCount,
    int ProjectCount,
    int MessageCount);

public record UpdateUserStatusRequest(bool IsDisabled);

public record BootstrapAdminRequest(string Phone, string Secret);

public record AdminTaskListItemDto(
    Guid Id,
    string Title,
    string Status,
    Guid? ProjectId,
    string? ProjectName,
    Guid? OwnerId,
    string? OwnerName,
    Guid CreatedById,
    string CreatedByName,
    DateTimeOffset? DueDate,
    bool IsDeleted,
    DateTimeOffset CreatedAt);

public record AdminTaskListQuery(string? Search, string? Status, Guid? ProjectId, bool IncludeDeleted, int Page, int PageSize);

public record AdminProjectListItemDto(
    Guid Id,
    string Name,
    string Status,
    Guid CreatedById,
    string CreatedByName,
    int MemberCount,
    int TaskCount,
    bool IsDeleted,
    DateTimeOffset CreatedAt);

public record AdminProjectListQuery(string? Search, bool IncludeDeleted, int Page, int PageSize);

public record AdminChecklistItemDto(Guid Id, string Title, bool IsCompleted, int SortOrder);

public record AdminTaskParticipantDto(Guid UserId, string Name, string Phone);

public record AdminTaskUpdateItemDto(Guid Id, Guid AuthorId, string AuthorName, string Type, string? Text, DateTimeOffset CreatedAt);

public record AdminTaskActivityDto(Guid Id, Guid? ActorId, string? ActorName, string Type, string? Metadata, DateTimeOffset CreatedAt);

public record AdminTaskDetailDto(
    Guid Id,
    string Title,
    string? Description,
    string Status,
    Guid? ProjectId,
    string? ProjectName,
    Guid CreatedById,
    string CreatedByName,
    Guid? OwnerId,
    string? OwnerName,
    DateTimeOffset? DueDate,
    DateTimeOffset CreatedAt,
    DateTimeOffset? CompletedAt,
    bool IsDeleted,
    IReadOnlyList<AdminChecklistItemDto> ChecklistItems,
    IReadOnlyList<AdminTaskParticipantDto> Participants,
    IReadOnlyList<AdminTaskUpdateItemDto> Updates,
    IReadOnlyList<AdminTaskActivityDto> Activities);

public record AdminProjectMemberDto(Guid UserId, string Name, string Phone, string Role);

public record AdminProjectDetailDto(
    Guid Id,
    string Name,
    string? Description,
    string Color,
    string Status,
    Guid CreatedById,
    string CreatedByName,
    DateTimeOffset CreatedAt,
    bool IsDeleted,
    IReadOnlyList<AdminProjectMemberDto> Members,
    IReadOnlyList<AdminTaskListItemDto> Tasks);

public record AdminUserTaskDto(Guid Id, string Title, string Status, string Relation, DateTimeOffset? DueDate);

public record AdminUserProjectDto(Guid Id, string Name, string Status, string Role);

public record ActivityFeedItemDto(Guid Id, string Type, string Title, string? Subtitle, DateTimeOffset CreatedAt);

public record AdminReportListItemDto(
    Guid Id,
    Guid ReporterId,
    string ReporterName,
    Guid ReportedUserId,
    string ReportedUserName,
    string Reason,
    Guid? MessageId,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ResolvedAt);

public record AdminAccessLogItemDto(
    Guid Id,
    Guid AdminUserId,
    string AdminUserName,
    string ResourceType,
    Guid ResourceId,
    DateTimeOffset AccessedAt);
