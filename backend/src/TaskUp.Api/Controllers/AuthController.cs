using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TaskUp.Application.Identity;
using TaskUp.Application.Identity.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(IIdentityService identityService) : ControllerBase
{
    [HttpPost("otp/request")]
    [EnableRateLimiting("otp")]
    public async Task<ActionResult<RequestOtpResponse>> RequestOtp(RequestOtpRequest request, CancellationToken cancellationToken)
        => Ok(await identityService.RequestOtpAsync(request, cancellationToken));

    [HttpPost("otp/verify")]
    public async Task<ActionResult<AuthResult>> VerifyOtp(VerifyOtpRequest request, CancellationToken cancellationToken)
        => Ok(await identityService.VerifyOtpAsync(request, cancellationToken));

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResult>> Refresh(RefreshRequest request, CancellationToken cancellationToken)
        => Ok(await identityService.RefreshAsync(request, cancellationToken));

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshRequest request, CancellationToken cancellationToken)
    {
        await identityService.LogoutAsync(request.RefreshToken, cancellationToken);
        return NoContent();
    }
}
