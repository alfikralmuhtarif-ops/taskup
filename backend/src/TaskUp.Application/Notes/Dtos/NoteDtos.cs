namespace TaskUp.Application.Notes.Dtos;

public record NoteListItemDto(
    Guid Id,
    string Title,
    string ContentPreview,
    bool IsPinned,
    Guid? TaskId,
    string? TaskTitle,
    DateTimeOffset UpdatedAt);

public record NoteDetailDto(
    Guid Id,
    string Title,
    string Content,
    bool IsPinned,
    Guid? TaskId,
    string? TaskTitle,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? DeletedAt);

public record NoteListQuery(string? Query, bool IncludeDeleted);

public record CreateNoteRequest(string Title, string? Content, Guid? TaskId);

public record UpdateNoteRequest(string? Title, string? Content, bool? IsPinned, Guid? TaskId);
