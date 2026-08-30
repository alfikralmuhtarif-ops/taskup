using TaskUp.Application.People.Dtos;

namespace TaskUp.Application.People;

/// <summary>Registered-user picker for share/invite/participant flows (contract §2, "People / Invites").</summary>
public interface IPeopleService
{
    Task<IReadOnlyList<PersonDto>> SearchAsync(Guid userId, string query, CancellationToken cancellationToken = default);

    /// <summary>One-directional: blocks new conversations/messages between the two users in either direction (see ChatService).</summary>
    Task BlockAsync(Guid userId, Guid targetUserId, CancellationToken cancellationToken = default);

    Task UnblockAsync(Guid userId, Guid targetUserId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BlockedUserDto>> ListBlockedAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>App Store Guideline 1.2 (user-generated content) requires a real in-app report mechanism — reviewed via /admin/reports.</summary>
    Task ReportAsync(Guid reporterId, Guid targetUserId, ReportUserRequest request, CancellationToken cancellationToken = default);
}
