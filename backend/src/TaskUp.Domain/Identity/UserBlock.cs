namespace TaskUp.Domain.Identity;

/// <summary>
/// One-directional: BlockerId blocked BlockedId. A blocked relationship prevents new
/// conversations/messages between the two in either direction (see ChatService), independent
/// of whether the other side has also blocked back.
/// </summary>
public class UserBlock
{
    public Guid Id { get; set; }

    public Guid BlockerId { get; set; }
    public User Blocker { get; set; } = default!;

    public Guid BlockedId { get; set; }
    public User Blocked { get; set; } = default!;

    public DateTimeOffset CreatedAt { get; set; }
}
