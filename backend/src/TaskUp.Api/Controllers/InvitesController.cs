using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Invites;
using TaskUp.Application.Invites.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
public class InvitesController(IInviteService inviteService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost("invites")]
    public async Task<ActionResult<InviteDto>> Create(CreateInviteRequest request, CancellationToken cancellationToken)
        => Ok(await inviteService.CreateAsync(currentUser.UserId, request, cancellationToken));

    [HttpGet("contacts")]
    public async Task<ActionResult<IReadOnlyList<InviteDto>>> GetContacts(CancellationToken cancellationToken)
        => Ok(await inviteService.ListPendingSentByMeAsync(currentUser.UserId, cancellationToken));
}
