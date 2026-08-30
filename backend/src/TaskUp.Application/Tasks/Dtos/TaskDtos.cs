namespace TaskUp.Application.Tasks.Dtos;

public record TaskListItemDto(
    Guid Id,
    string Title,
    string Status,
    Guid? ProjectId,
    string? ProjectName,
    Guid? OwnerId,
    string? OwnerName,
    DateTimeOffset? DueDate,
    bool IsOverdue,
    int? Progress);

public record TaskParticipantDto(Guid UserId, string Name, string? AvatarUrl);

public record TaskDetailDto(
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
    bool IsOverdue,
    int? Progress,
    DateTimeOffset CreatedAt,
    DateTimeOffset? CompletedAt,
    IReadOnlyList<TaskParticipantDto> Participants);

public record TaskListQuery(string? Section, Guid? ProjectId, string? Status);

public record CreateTaskRequest(
    string Title,
    Guid? OwnerId,
    IReadOnlyList<Guid>? ParticipantIds,
    IReadOnlyList<string>? ExternalInvites,
    DateTimeOffset? DueDate,
    string? Description,
    Guid? ProjectId);

public record UpdateTaskRequest(string? Title, DateTimeOffset? DueDate, string? Description, Guid? OwnerId);

public record ChangeTaskStatusRequest(string Status);

public record AddParticipantsRequest(IReadOnlyList<Guid>? UserIds, IReadOnlyList<string>? ExternalInvites);
