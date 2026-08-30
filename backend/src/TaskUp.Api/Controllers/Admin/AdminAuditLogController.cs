using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Admin;
using TaskUp.Application.Admin.Dtos;
using TaskUp.Application.Common;

namespace TaskUp.Api.Controllers.Admin;

[ApiController]
[Authorize(Policy = "AdminOnly")]
[Route("admin/audit-log")]
public class AdminAuditLogController(IAdminService adminService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminAccessLogItemDto>>> List(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await adminService.ListAccessLogAsync(page, pageSize, cancellationToken));
}
