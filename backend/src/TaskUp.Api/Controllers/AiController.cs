using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Ai;
using TaskUp.Application.Ai.Dtos;
using TaskUp.Application.Tasks.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("ai")]
public class AiController(IAiService aiService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet("subscription")]
    public async Task<ActionResult<SubscriptionDto>> GetSubscription(CancellationToken cancellationToken)
        => Ok(await aiService.GetSubscriptionAsync(currentUser.UserId, cancellationToken));

    [HttpPost("subscription/trial/start")]
    public async Task<IActionResult> StartTrial(StartTrialRequest request, CancellationToken cancellationToken)
    {
        await aiService.StartTrialAsync(currentUser.UserId, request, cancellationToken);
        return NoContent();
    }

    [HttpPost("subscription/checkout")]
    public async Task<ActionResult<SubscriptionDto>> Checkout(CancellationToken cancellationToken)
        => Ok(await aiService.CheckoutAsync(currentUser.UserId, cancellationToken));

    [HttpGet("tasks/{id:guid}/summary")]
    public async Task<ActionResult<AiTaskSummaryDto>> GetSummary(Guid id, CancellationToken cancellationToken)
        => Ok(await aiService.GetSummaryAsync(currentUser.UserId, id, cancellationToken));

    [HttpGet("tasks/{id:guid}/risk")]
    public async Task<ActionResult<AiTaskRiskDto>> GetRisk(Guid id, CancellationToken cancellationToken)
        => Ok(await aiService.GetRiskAsync(currentUser.UserId, id, cancellationToken));

    [HttpGet("tasks/{id:guid}/suggestions")]
    public async Task<ActionResult<IReadOnlyList<AiSuggestionDto>>> GetSuggestions(Guid id, CancellationToken cancellationToken)
        => Ok(await aiService.GetSuggestionsAsync(currentUser.UserId, id, cancellationToken));

    [HttpPost("tasks/{id:guid}/suggestions/{suggestionId:guid}/accept")]
    public async Task<ActionResult<ChecklistItemDto>> AcceptSuggestion(Guid id, Guid suggestionId, CancellationToken cancellationToken)
        => Ok(await aiService.AcceptSuggestionAsync(currentUser.UserId, id, suggestionId, cancellationToken));

    [HttpPost("tasks/{id:guid}/suggestions/{suggestionId:guid}/dismiss")]
    public async Task<IActionResult> DismissSuggestion(Guid id, Guid suggestionId, CancellationToken cancellationToken)
    {
        await aiService.DismissSuggestionAsync(currentUser.UserId, id, suggestionId, cancellationToken);
        return NoContent();
    }
}
