using TaskUp.Application.Invites.Dtos;

namespace TaskUp.Application.Invites;

public interface IInviteService
{
    Task<InviteDto> CreateAsync(Guid userId, CreateInviteRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// GET /contacts (contract §16): the "invite-needed" half of that screen — invites
    /// the caller has already sent that haven't been joined yet. The "on-app" half is
    /// necessarily stateless (D8) and is served by POST /users/me/contacts/sync instead,
    /// since the caller's raw contact book is never persisted to reconstruct it here.
    /// </summary>
    Task<IReadOnlyList<InviteDto>> ListPendingSentByMeAsync(Guid userId, CancellationToken cancellationToken = default);
}
