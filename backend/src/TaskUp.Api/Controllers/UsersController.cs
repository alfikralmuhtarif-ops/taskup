using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Identity;
using TaskUp.Application.Identity.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("users/me")]
public class UsersController(IIdentityService identityService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserProfileDto>> GetMe(CancellationToken cancellationToken)
        => Ok(await identityService.GetProfileAsync(currentUser.UserId, cancellationToken));

    [HttpPatch]
    public async Task<ActionResult<UserProfileDto>> UpdateMe(UpdateProfileRequest request, CancellationToken cancellationToken)
        => Ok(await identityService.UpdateProfileAsync(currentUser.UserId, request, cancellationToken));

    [HttpPost("phone/change/request")]
    [EnableRateLimiting("otp")]
    public async Task<ActionResult<RequestOtpResponse>> RequestPhoneChange(PhoneChangeRequest request, CancellationToken cancellationToken)
        => Ok(await identityService.RequestPhoneChangeAsync(currentUser.UserId, request, cancellationToken));

    [HttpPost("phone/change/verify")]
    public async Task<ActionResult<UserProfileDto>> VerifyPhoneChange(PhoneChangeVerify request, CancellationToken cancellationToken)
        => Ok(await identityService.VerifyPhoneChangeAsync(currentUser.UserId, request, cancellationToken));

    [HttpPost("contacts/sync")]
    public async Task<ActionResult<ContactsSyncResponse>> SyncContacts(ContactsSyncRequest request, CancellationToken cancellationToken)
        => Ok(await identityService.SyncContactsAsync(currentUser.UserId, request, cancellationToken));

    [HttpPost("consents")]
    public async Task<IActionResult> RecordConsent(ConsentRequest request, CancellationToken cancellationToken)
    {
        await identityService.RecordConsentAsync(currentUser.UserId, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteMe(CancellationToken cancellationToken)
    {
        await identityService.DeleteAccountAsync(currentUser.UserId, cancellationToken);
        return NoContent();
    }
}
