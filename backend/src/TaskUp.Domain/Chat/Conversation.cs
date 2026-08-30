using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Chat;

/// <summary>
/// 1:1 only (D1 — group chat/Polls excluded from V1), so two FK columns are used
/// instead of a join table. A unique constraint on the (lower, higher) participant
/// pair prevents duplicate conversations between the same two users.
/// </summary>
public class Conversation
{
    public Guid Id { get; set; }

    public Guid ParticipantAId { get; set; }
    public User ParticipantA { get; set; } = default!;

    public Guid ParticipantBId { get; set; }
    public User ParticipantB { get; set; } = default!;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? LastMessageAt { get; set; }

    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
