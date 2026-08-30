namespace TaskUp.Application.Authorization;

/// <summary>
/// The caller's relationship to a task, resolved once (typically via a single
/// query in the Infrastructure-layer <see cref="ITaskAuthorizationService"/>
/// implementation) and then handed to the pure <see cref="TaskPermissionPolicy"/>.
/// </summary>
public record TaskAccessContext(
    Guid TaskId,
    Guid CreatedById,
    Guid? OwnerId,
    IReadOnlyCollection<Guid> ParticipantIds,
    bool RequesterIsProjectMember);
