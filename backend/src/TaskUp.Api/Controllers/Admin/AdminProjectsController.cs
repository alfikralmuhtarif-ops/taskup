using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Admin;
using TaskUp.Application.Admin.Dtos;
using TaskUp.Application.Common;

namespace TaskUp.Api.Controllers.Admin;

[ApiController]
[Authorize(Policy = "AdminOnly")]
[Route("admin/projects")]
public class AdminProjectsController(IAdminService adminService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminProjectListItemDto>>> List(
        [FromQuery] string? search, [FromQuery] bool includeDeleted = false,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await adminService.ListProjectsAsync(new AdminProjectListQuery(search, includeDeleted, page, pageSize), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminProjectDetailDto>> Get(Guid id, CancellationToken cancellationToken)
        => Ok(await adminService.GetProjectAsync(id, currentUser.UserId, cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await adminService.DeleteProjectAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<IActionResult> Restore(Guid id, CancellationToken cancellationToken)
    {
        await adminService.RestoreProjectAsync(id, cancellationToken);
        return NoContent();
    }
}
