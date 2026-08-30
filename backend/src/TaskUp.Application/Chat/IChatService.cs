using TaskUp.Application.Chat.Dtos;
using TaskUp.Application.Common;

namespace TaskUp.Application.Chat;

public interface IChatService
{
    Task<IReadOnlyList<ConversationDto>> ListConversationsAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<ConversationDto> GetOrCreateConversationAsync(Guid userId, CreateConversationRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<MessageDto>> GetMessagesAsync(Guid userId, Guid conversationId, DateTimeOffset? before, int limit, CancellationToken cancellationToken = default);

    Task<MessageDto> SendMessageAsync(Guid userId, Guid conversationId, SendMessageRequest request, CancellationToken cancellationToken = default);

    Task<MessageDto> ShareTaskAsync(Guid userId, Guid conversationId, ShareTaskRequest request, CancellationToken cancellationToken = default);

    Task<MessageDto> ShareProjectAsync(Guid userId, Guid conversationId, ShareProjectRequest request, CancellationToken cancellationToken = default);

    Task<MessageDto> ConvertToTaskAsync(Guid userId, Guid conversationId, Guid messageId, ConvertToTaskRequest request, CancellationToken cancellationToken = default);
}
