using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Admin;
using TaskUp.Application.Admin.Dtos;
using TaskUp.Application.Common;

namespace TaskUp.Api.Controllers.Admin;

[ApiController]
[Authorize(Policy = "AdminOnly")]
[Route("admin/tasks")]
public class AdminTasksController(IAdminService adminService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminTaskListItemDto>>> List(
        [FromQuery] string? search, [FromQuery] string? status, [FromQuery] Guid? projectId,
        [FromQuery] bool includeDeleted = false, [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
        => Ok(await adminService.ListTasksAsync(new AdminTaskListQuery(search, status, projectId, includeDeleted, page, pageSize), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminTaskDetailDto>> Get(Guid id, CancellationToken cancellationToken)
        => Ok(await adminService.GetTaskAsync(id, currentUser.UserId, cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await adminService.DeleteTaskAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<IActionResult> Restore(Guid id, CancellationToken cancellationToken)
    {
        await adminService.RestoreTaskAsync(id, cancellationToken);
        return NoContent();
    }
}
