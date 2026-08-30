using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Admin;
using TaskUp.Application.Admin.Dtos;

namespace TaskUp.Api.Controllers.Admin;

/// <summary>
/// Anonymous but secret-gated: the only way a User ever becomes IsSystemAdmin.
/// The caller must already have a registered account (normal phone+OTP signup);
/// this endpoint just flips the flag once given the shared bootstrap secret.
/// </summary>
[ApiController]
[Route("admin/bootstrap")]
public class AdminBootstrapController(IAdminService adminService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Bootstrap(BootstrapAdminRequest request, CancellationToken cancellationToken)
    {
        await adminService.BootstrapAdminAsync(request, cancellationToken);
        return NoContent();
    }
}
