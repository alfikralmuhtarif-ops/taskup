using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Shared;

/// <summary>
/// Polymorphic — an @mention inside a TaskUpdate or a chat Message body.
/// Drives the Mention notification category.
/// </summary>
public enum MentionOwnerType
{
    TaskUpdate,
    Message,
}

public class Mention
{
    public Guid Id { get; set; }

    public MentionOwnerType OwnerType { get; set; }

    public Guid OwnerId { get; set; }

    public Guid MentionedUserId { get; set; }
    public User MentionedUser { get; set; } = default!;

    public DateTimeOffset CreatedAt { get; set; }
}
