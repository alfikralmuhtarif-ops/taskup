using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Admin;
using TaskUp.Application.Admin.Dtos;

namespace TaskUp.Api.Controllers.Admin;

[ApiController]
[Authorize(Policy = "AdminOnly")]
[Route("admin/dashboard")]
public class AdminDashboardController(IAdminService adminService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardStatsDto>> Get(CancellationToken cancellationToken)
        => Ok(await adminService.GetDashboardStatsAsync(cancellationToken));

    [HttpGet("activity")]
    public async Task<ActionResult<IReadOnlyList<ActivityFeedItemDto>>> GetActivity([FromQuery] int limit = 20, CancellationToken cancellationToken = default)
        => Ok(await adminService.GetRecentActivityAsync(limit, cancellationToken));
}
