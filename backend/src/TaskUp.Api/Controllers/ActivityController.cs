using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Tasks;
using TaskUp.Application.Tasks.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("activity")]
public class ActivityController(ITaskService taskService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ActivityFeedItemDto>>> Get([FromQuery] string? scope, CancellationToken cancellationToken)
        => Ok(await taskService.GetTeamActivityAsync(currentUser.UserId, cancellationToken));
}
