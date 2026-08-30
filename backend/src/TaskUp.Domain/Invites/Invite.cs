using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Invites;

/// <summary>
/// Generic invite entity replacing separate per-module invite tables.
/// ContextType/ContextId point at what the invite grants access to once accepted
/// (a Task, a Project, or Direct = just adds a contact/conversation).
/// </summary>
public enum InviteContextType
{
    Task,
    Project,
    Direct,
}

public enum InviteStatus
{
    Pending,
    Joined,
}

public class Invite
{
    public Guid Id { get; set; }

    public Guid InviterId { get; set; }
    public User Inviter { get; set; } = default!;

    public string Phone { get; set; } = default!;

    public string? Label { get; set; }

    public InviteContextType ContextType { get; set; }

    public Guid? ContextId { get; set; }

    public InviteStatus Status { get; set; } = InviteStatus.Pending;

    public DateTimeOffset SentAt { get; set; }

    public DateTimeOffset? JoinedAt { get; set; }

    public Guid? JoinedUserId { get; set; }
    public User? JoinedUser { get; set; }
}
