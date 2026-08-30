using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Admin;
using TaskUp.Application.Admin.Dtos;
using TaskUp.Application.Common;

namespace TaskUp.Api.Controllers.Admin;

[ApiController]
[Authorize(Policy = "AdminOnly")]
[Route("admin/reports")]
public class AdminReportsController(IAdminService adminService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminReportListItemDto>>> List(
        [FromQuery] bool includeResolved = false, [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
        => Ok(await adminService.ListReportsAsync(includeResolved, page, pageSize, cancellationToken));

    [HttpPost("{id:guid}/resolve")]
    public async Task<IActionResult> Resolve(Guid id, CancellationToken cancellationToken)
    {
        await adminService.ResolveReportAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/reopen")]
    public async Task<IActionResult> Reopen(Guid id, CancellationToken cancellationToken)
    {
        await adminService.ReopenReportAsync(id, cancellationToken);
        return NoContent();
    }
}
