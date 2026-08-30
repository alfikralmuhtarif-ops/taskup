using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Identity;
using TaskUp.Application.Identity.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("devices")]
public class DevicesController(IIdentityService identityService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Register(RegisterDeviceRequest request, CancellationToken cancellationToken)
    {
        await identityService.RegisterDeviceAsync(currentUser.UserId, request, cancellationToken);
        return NoContent();
    }
}
