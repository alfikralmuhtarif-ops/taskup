using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Authorization;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Application.Invites;
using TaskUp.Application.Invites.Dtos;
using TaskUp.Domain.Invites;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Invites;

public class InviteService(TaskUpDbContext db, ITaskAuthorizationService taskAuth, IProjectAuthorizationService projectAuth) : IInviteService
{
    public async Task<InviteDto> CreateAsync(Guid userId, CreateInviteRequest request, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<InviteContextType>(request.Context.Type, true, out var contextType))
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["context.type"] = ["Must be 'Task', 'Project' or 'Direct'."],
            });
        }

        // Mirrors AddParticipants/AddMembers — an invite is just a deferred version of the
        // same "add this person" action, so it needs the same permission at creation time,
        // not just when the invitee eventually registers (ReconcilePendingInvitesAsync
        // trusts InviterId by then and no longer has a chance to say no).
        if (contextType is InviteContextType.Task or InviteContextType.Project && request.Context.Id is null)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["context.id"] = ["Required for a Task or Project invite."],
            });
        }

        switch (contextType)
        {
            case InviteContextType.Task:
                await taskAuth.EnsureUserCanAsync(userId, request.Context.Id!.Value, TaskPermission.ManageParticipants, cancellationToken);
                break;
            case InviteContextType.Project:
                await projectAuth.EnsureUserCanAsync(userId, request.Context.Id!.Value, ProjectPermission.ManageMembers, cancellationToken);
                break;
        }

        var invite = new Invite
        {
            Id = Guid.NewGuid(),
            InviterId = userId,
            Phone = request.Phone,
            Label = request.Name,
            ContextType = contextType,
            ContextId = request.Context.Id,
            Status = InviteStatus.Pending,
            SentAt = DateTimeOffset.UtcNow,
        };

        db.Invites.Add(invite);
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(invite);
    }

    public async Task<IReadOnlyList<InviteDto>> ListPendingSentByMeAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var invites = await db.Invites
            .Where(i => i.InviterId == userId && i.Status == InviteStatus.Pending)
            .OrderByDescending(i => i.SentAt)
            .ToListAsync(cancellationToken);

        return invites.Select(ToDto).ToList();
    }

    private static InviteDto ToDto(Invite invite)
        => new(invite.Id, invite.Phone, invite.Label, invite.ContextType.ToString(), invite.ContextId, invite.Status.ToString(), invite.SentAt);
}
