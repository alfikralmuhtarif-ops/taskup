using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Admin;
using TaskUp.Application.Admin.Dtos;
using TaskUp.Application.Common;

namespace TaskUp.Api.Controllers.Admin;

[ApiController]
[Authorize(Policy = "AdminOnly")]
[Route("admin/users")]
public class AdminUsersController(IAdminService adminService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminUserListItemDto>>> List(
        [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await adminService.ListUsersAsync(search, page, pageSize, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminUserDetailDto>> Get(Guid id, CancellationToken cancellationToken)
        => Ok(await adminService.GetUserAsync(id, currentUser.UserId, cancellationToken));

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<AdminUserDetailDto>> SetStatus(Guid id, UpdateUserStatusRequest request, CancellationToken cancellationToken)
        => Ok(await adminService.SetUserDisabledAsync(id, request.IsDisabled, cancellationToken));

    [HttpGet("{id:guid}/tasks")]
    public async Task<ActionResult<IReadOnlyList<AdminUserTaskDto>>> GetTasks(Guid id, CancellationToken cancellationToken)
        => Ok(await adminService.GetUserTasksAsync(id, currentUser.UserId, cancellationToken));

    [HttpGet("{id:guid}/projects")]
    public async Task<ActionResult<IReadOnlyList<AdminUserProjectDto>>> GetProjects(Guid id, CancellationToken cancellationToken)
        => Ok(await adminService.GetUserProjectsAsync(id, currentUser.UserId, cancellationToken));
}
