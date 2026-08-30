using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Chat;
using TaskUp.Application.Chat.Dtos;
using TaskUp.Application.Common;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("conversations")]
public class ConversationsController(IChatService chatService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ConversationDto>>> List(CancellationToken cancellationToken)
        => Ok(await chatService.ListConversationsAsync(currentUser.UserId, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<ConversationDto>> Create(CreateConversationRequest request, CancellationToken cancellationToken)
        => Ok(await chatService.GetOrCreateConversationAsync(currentUser.UserId, request, cancellationToken));

    [HttpGet("{id:guid}/messages")]
    public async Task<ActionResult<PagedResult<MessageDto>>> GetMessages(
        Guid id, [FromQuery] DateTimeOffset? before, [FromQuery] int limit, CancellationToken cancellationToken)
        => Ok(await chatService.GetMessagesAsync(currentUser.UserId, id, before, limit, cancellationToken));

    [HttpPost("{id:guid}/messages")]
    public async Task<ActionResult<MessageDto>> SendMessage(Guid id, SendMessageRequest request, CancellationToken cancellationToken)
        => Ok(await chatService.SendMessageAsync(currentUser.UserId, id, request, cancellationToken));

    [HttpPost("{id:guid}/messages/share-task")]
    public async Task<ActionResult<MessageDto>> ShareTask(Guid id, ShareTaskRequest request, CancellationToken cancellationToken)
        => Ok(await chatService.ShareTaskAsync(currentUser.UserId, id, request, cancellationToken));

    [HttpPost("{id:guid}/messages/share-project")]
    public async Task<ActionResult<MessageDto>> ShareProject(Guid id, ShareProjectRequest request, CancellationToken cancellationToken)
        => Ok(await chatService.ShareProjectAsync(currentUser.UserId, id, request, cancellationToken));

    [HttpPost("{id:guid}/messages/{messageId:guid}/convert-to-task")]
    public async Task<ActionResult<MessageDto>> ConvertToTask(Guid id, Guid messageId, ConvertToTaskRequest request, CancellationToken cancellationToken)
        => Ok(await chatService.ConvertToTaskAsync(currentUser.UserId, id, messageId, request, cancellationToken));
}
