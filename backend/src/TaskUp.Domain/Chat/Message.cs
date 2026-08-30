using TaskUp.Domain.Identity;
using TaskUp.Domain.Projects;
using TaskUp.Domain.Tasks;

namespace TaskUp.Domain.Chat;

public enum MessageType
{
    Text,
    Image,
    File,
    Voice,
}

/// <summary>
/// SharedTaskId/SharedProjectId back a "share to chat" message; ConvertedToTaskId
/// records that this message was turned into a task via "convert to task" (D1).
/// </summary>
public class Message
{
    public Guid Id { get; set; }

    public Guid ConversationId { get; set; }
    public Conversation Conversation { get; set; } = default!;

    public Guid SenderId { get; set; }
    public User Sender { get; set; } = default!;

    public MessageType Type { get; set; } = MessageType.Text;

    public string? Text { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? ReadAt { get; set; }

    public Guid? SharedTaskId { get; set; }
    public TaskItem? SharedTask { get; set; }

    public Guid? SharedProjectId { get; set; }
    public Project? SharedProject { get; set; }

    public Guid? ConvertedToTaskId { get; set; }
    public TaskItem? ConvertedToTask { get; set; }
}
