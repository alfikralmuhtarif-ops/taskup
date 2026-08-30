using TaskUp.Application.Tasks.Dtos;

namespace TaskUp.Application.Chat.Dtos;

public record ConversationParticipantDto(Guid UserId, string Name, string? AvatarUrl);

public record ConversationDto(
    Guid Id,
    ConversationParticipantDto OtherParticipant,
    string? LastMessageText,
    DateTimeOffset? LastMessageAt);

public record CreateConversationRequest(Guid? UserId, string? Phone);

public record MessageDto(
    Guid Id,
    Guid ConversationId,
    Guid SenderId,
    string SenderName,
    string? SenderAvatarUrl,
    string Type,
    string? Text,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ReadAt,
    Guid? SharedTaskId,
    Guid? SharedProjectId,
    Guid? ConvertedToTaskId,
    IReadOnlyList<AttachmentDto> Attachments);

public record SendMessageRequest(string? Text, Guid? FileId, string Type, IReadOnlyList<Guid>? Mentions);

public record ShareTaskRequest(Guid TaskId);

public record ShareProjectRequest(Guid ProjectId);

public record ConvertToTaskRequest(string? Title);
