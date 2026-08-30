using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.People;
using TaskUp.Application.People.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("people")]
public class PeopleController(IPeopleService peopleService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet("search")]
    public async Task<ActionResult<IReadOnlyList<PersonDto>>> Search([FromQuery] string? q, CancellationToken cancellationToken)
        => Ok(await peopleService.SearchAsync(currentUser.UserId, q ?? string.Empty, cancellationToken));

    [HttpPost("{userId:guid}/block")]
    public async Task<IActionResult> Block(Guid userId, CancellationToken cancellationToken)
    {
        await peopleService.BlockAsync(currentUser.UserId, userId, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{userId:guid}/block")]
    public async Task<IActionResult> Unblock(Guid userId, CancellationToken cancellationToken)
    {
        await peopleService.UnblockAsync(currentUser.UserId, userId, cancellationToken);
        return NoContent();
    }

    [HttpGet("blocked")]
    public async Task<ActionResult<IReadOnlyList<BlockedUserDto>>> ListBlocked(CancellationToken cancellationToken)
        => Ok(await peopleService.ListBlockedAsync(currentUser.UserId, cancellationToken));

    [HttpPost("{userId:guid}/report")]
    public async Task<IActionResult> Report(Guid userId, ReportUserRequest request, CancellationToken cancellationToken)
    {
        await peopleService.ReportAsync(currentUser.UserId, userId, request, cancellationToken);
        return NoContent();
    }
}
