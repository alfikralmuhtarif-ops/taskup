namespace TaskUp.Application.Tasks.Dtos;

public record ChecklistItemDto(
    Guid Id,
    string Title,
    bool IsCompleted,
    int SortOrder,
    Guid? CompletedById,
    DateTimeOffset? CompletedAt);

public record CreateChecklistItemRequest(string Title, int? SortOrder);

public record UpdateChecklistItemRequest(string? Title, int? SortOrder);
