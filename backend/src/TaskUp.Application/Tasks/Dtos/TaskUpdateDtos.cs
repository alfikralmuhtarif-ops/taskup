namespace TaskUp.Application.Tasks.Dtos;

public record AttachmentDto(Guid Id, string FileName, long FileSize, string MimeType, string StorageUrl);

public record TaskUpdateDto(
    Guid Id,
    Guid AuthorId,
    string AuthorName,
    string? AuthorAvatarUrl,
    string Type,
    string? Text,
    DateTimeOffset CreatedAt,
    IReadOnlyList<AttachmentDto> Attachments);

public record CreateTaskUpdateRequest(string? Text, Guid? FileId, IReadOnlyList<Guid>? Mentions);

public record TaskReportDto(
    Guid TaskId,
    string Title,
    string Status,
    int? Progress,
    int TotalChecklistItems,
    int CompletedChecklistItems,
    DateTimeOffset? DueDate,
    bool IsOverdue,
    int UpdateCount,
    DateTimeOffset? LastUpdateAt);

public record ActivityFeedItemDto(
    Guid TaskId,
    string TaskTitle,
    Guid AuthorId,
    string AuthorName,
    string? AuthorAvatarUrl,
    string? Text,
    DateTimeOffset CreatedAt);
