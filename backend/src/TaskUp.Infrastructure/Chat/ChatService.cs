using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Authorization;
using TaskUp.Application.Chat;
using TaskUp.Application.Chat.Dtos;
using TaskUp.Application.Common;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Application.Notifications;
using TaskUp.Application.RealTime;
using TaskUp.Application.Tasks.Dtos;
using TaskUp.Domain.Chat;
using TaskUp.Domain.Notifications;
using TaskUp.Domain.Shared;
using TaskUp.Domain.Tasks;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Chat;

public class ChatService(
    TaskUpDbContext db,
    ITaskAuthorizationService taskAuth,
    IProjectAuthorizationService projectAuth,
    INotificationPublisher notificationPublisher,
    IRealTimeNotifier realTimeNotifier,
    IFieldEncryptionService fieldEncryption) : IChatService
{
    public async Task<IReadOnlyList<ConversationDto>> ListConversationsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var conversations = await db.Conversations
            .Where(c => c.ParticipantAId == userId || c.ParticipantBId == userId)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                OtherUserId = c.ParticipantAId == userId ? c.ParticipantBId : c.ParticipantAId,
                OtherName = c.ParticipantAId == userId ? c.ParticipantB.Name : c.ParticipantA.Name,
                OtherAvatar = c.ParticipantAId == userId ? c.ParticipantB.AvatarUrl : c.ParticipantA.AvatarUrl,
                c.LastMessageAt,
                LastMessageText = c.Messages.OrderByDescending(m => m.CreatedAt).Select(m => m.Text).FirstOrDefault(),
            })
            .ToListAsync(cancellationToken);

        return conversations
            .Select(c => new ConversationDto(
                c.Id, new ConversationParticipantDto(c.OtherUserId, c.OtherName, c.OtherAvatar), c.LastMessageText, c.LastMessageAt))
            .ToList();
    }

    public async Task<ConversationDto> GetOrCreateConversationAsync(Guid userId, CreateConversationRequest request, CancellationToken cancellationToken = default)
    {
        Guid otherUserId;
        if (request.UserId is not null)
        {
            otherUserId = request.UserId.Value;
        }
        else if (request.Phone is not null)
        {
            var phoneHash = fieldEncryption.Hash(request.Phone);
            otherUserId = await db.Users.Where(u => u.PhoneHash == phoneHash).Select(u => u.Id).FirstOrDefaultAsync(cancellationToken);
            if (otherUserId == Guid.Empty)
            {
                throw new NotFoundException("User", request.Phone);
            }
        }
        else
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["userId"] = ["Either userId or phone is required."],
            });
        }

        if (otherUserId == userId)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["userId"] = ["Cannot start a conversation with yourself."],
            });
        }

        await EnsureNotBlockedAsync(userId, otherUserId, cancellationToken);

        var (a, b) = userId.CompareTo(otherUserId) < 0 ? (userId, otherUserId) : (otherUserId, userId);

        var conversation = await db.Conversations.FirstOrDefaultAsync(c => c.ParticipantAId == a && c.ParticipantBId == b, cancellationToken);
        if (conversation is null)
        {
            conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                ParticipantAId = a,
                ParticipantBId = b,
                CreatedAt = DateTimeOffset.UtcNow,
            };
            db.Conversations.Add(conversation);
            await db.SaveChangesAsync(cancellationToken);
        }

        var other = await db.Users.Where(u => u.Id == otherUserId).Select(u => new { u.Name, u.AvatarUrl }).FirstAsync(cancellationToken);
        return new ConversationDto(conversation.Id, new ConversationParticipantDto(otherUserId, other.Name, other.AvatarUrl), null, conversation.LastMessageAt);
    }

    public async Task<PagedResult<MessageDto>> GetMessagesAsync(Guid userId, Guid conversationId, DateTimeOffset? before, int limit, CancellationToken cancellationToken = default)
    {
        await EnsureParticipantAsync(userId, conversationId, cancellationToken);

        limit = limit is > 0 and <= 100 ? limit : 30;

        var query = db.Messages.Where(m => m.ConversationId == conversationId);
        if (before is not null)
        {
            query = query.Where(m => m.CreatedAt < before);
        }

        var totalCount = await db.Messages.CountAsync(m => m.ConversationId == conversationId, cancellationToken);

        var messages = await query
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .Select(m => new
            {
                m.Id,
                m.ConversationId,
                m.SenderId,
                SenderName = m.Sender.Name,
                SenderAvatarUrl = m.Sender.AvatarUrl,
                m.Type,
                m.Text,
                m.CreatedAt,
                m.ReadAt,
                m.SharedTaskId,
                m.SharedProjectId,
                m.ConvertedToTaskId,
            })
            .ToListAsync(cancellationToken);

        var messageIds = messages.Select(m => m.Id).ToList();
        var attachments = await db.Attachments
            .Where(a => a.OwnerType == AttachmentOwnerType.Message && messageIds.Contains(a.OwnerId))
            .ToListAsync(cancellationToken);

        var items = messages.Select(m => new MessageDto(
            m.Id, m.ConversationId, m.SenderId, m.SenderName, m.SenderAvatarUrl, m.Type.ToString(), m.Text, m.CreatedAt, m.ReadAt,
            m.SharedTaskId, m.SharedProjectId, m.ConvertedToTaskId,
            attachments.Where(a => a.OwnerId == m.Id).Select(a => new AttachmentDto(a.Id, a.FileName, a.FileSize, a.MimeType, a.StorageUrl)).ToList()))
            .ToList();

        return new PagedResult<MessageDto>(items, 1, limit, totalCount);
    }

    public async Task<MessageDto> SendMessageAsync(Guid userId, Guid conversationId, SendMessageRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureParticipantAsync(userId, conversationId, cancellationToken);

        var conversationParticipants = await db.Conversations
            .Where(c => c.Id == conversationId)
            .Select(c => new { c.ParticipantAId, c.ParticipantBId })
            .FirstAsync(cancellationToken);
        var otherParticipantId = conversationParticipants.ParticipantAId == userId
            ? conversationParticipants.ParticipantBId
            : conversationParticipants.ParticipantAId;
        await EnsureNotBlockedAsync(userId, otherParticipantId, cancellationToken);

        if (!Enum.TryParse<MessageType>(request.Type, true, out var type))
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                [nameof(request.Type)] = ["Must be 'Text', 'Image', 'File' or 'Voice'."],
            });
        }

        var now = DateTimeOffset.UtcNow;
        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderId = userId,
            Type = type,
            Text = request.Text,
            CreatedAt = now,
        };
        db.Messages.Add(message);

        if (request.FileId is not null)
        {
            var attachment = await db.Attachments.FirstOrDefaultAsync(a => a.Id == request.FileId, cancellationToken);
            if (attachment is not null)
            {
                if (attachment.UploaderId != userId)
                {
                    throw new ForbiddenException();
                }

                attachment.OwnerType = AttachmentOwnerType.Message;
                attachment.OwnerId = message.Id;
            }
        }

        if (request.Mentions is { Count: > 0 })
        {
            foreach (var mentionedUserId in request.Mentions.Distinct())
            {
                db.Mentions.Add(new Mention
                {
                    Id = Guid.NewGuid(),
                    OwnerType = MentionOwnerType.Message,
                    OwnerId = message.Id,
                    MentionedUserId = mentionedUserId,
                    CreatedAt = now,
                });
            }
        }

        var conversation = await db.Conversations.FirstAsync(c => c.Id == conversationId, cancellationToken);
        conversation.LastMessageAt = now;

        await db.SaveChangesAsync(cancellationToken);

        var sender = await db.Users.Where(u => u.Id == userId).Select(u => u.Name).FirstAsync(cancellationToken);
        var otherUserId = conversation.ParticipantAId == userId ? conversation.ParticipantBId : conversation.ParticipantAId;

        var messageDto = await BuildMessageDtoAsync(message.Id, cancellationToken);
        await realTimeNotifier.NotifyUserAsync(otherUserId, "message:new", messageDto, cancellationToken);

        await notificationPublisher.PublishAsync(
            otherUserId, NotificationCategory.NewMessage, sender, request.Text, nameof(Conversation), conversationId, cancellationToken);

        if (request.Mentions is { Count: > 0 })
        {
            foreach (var mentionedUserId in request.Mentions.Distinct().Where(id => id != userId))
            {
                await notificationPublisher.PublishAsync(
                    mentionedUserId, NotificationCategory.Mention, $"{sender} mentioned you", request.Text, nameof(Conversation), conversationId, cancellationToken);
            }
        }

        return messageDto;
    }

    public async Task<MessageDto> ShareTaskAsync(Guid userId, Guid conversationId, ShareTaskRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureParticipantAsync(userId, conversationId, cancellationToken);
        await taskAuth.EnsureUserCanAsync(userId, request.TaskId, TaskPermission.View, cancellationToken);

        return await CreateSystemMessageAsync(userId, conversationId, m => m.SharedTaskId = request.TaskId, cancellationToken);
    }

    public async Task<MessageDto> ShareProjectAsync(Guid userId, Guid conversationId, ShareProjectRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureParticipantAsync(userId, conversationId, cancellationToken);
        await projectAuth.EnsureUserCanAsync(userId, request.ProjectId, ProjectPermission.View, cancellationToken);

        return await CreateSystemMessageAsync(userId, conversationId, m => m.SharedProjectId = request.ProjectId, cancellationToken);
    }

    public async Task<MessageDto> ConvertToTaskAsync(Guid userId, Guid conversationId, Guid messageId, ConvertToTaskRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureParticipantAsync(userId, conversationId, cancellationToken);

        var message = await db.Messages.FirstOrDefaultAsync(m => m.Id == messageId && m.ConversationId == conversationId, cancellationToken)
            ?? throw new NotFoundException(nameof(Message), messageId);

        var now = DateTimeOffset.UtcNow;
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title ?? message.Text ?? "Untitled task",
            CreatedById = userId,
            Status = Domain.Tasks.TaskStatus.NotStarted,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.Tasks.Add(task);

        db.TaskActivities.Add(new TaskActivity { Id = Guid.NewGuid(), TaskId = task.Id, ActorId = userId, Type = TaskActivityType.Created, CreatedAt = now });

        message.ConvertedToTaskId = task.Id;

        await db.SaveChangesAsync(cancellationToken);
        return await BuildMessageDtoAsync(messageId, cancellationToken);
    }

    private async Task<MessageDto> CreateSystemMessageAsync(Guid userId, Guid conversationId, Action<Message> configure, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderId = userId,
            Type = MessageType.Text,
            CreatedAt = now,
        };
        configure(message);
        db.Messages.Add(message);

        var conversation = await db.Conversations.FirstAsync(c => c.Id == conversationId, cancellationToken);
        conversation.LastMessageAt = now;

        await db.SaveChangesAsync(cancellationToken);
        return await BuildMessageDtoAsync(message.Id, cancellationToken);
    }

    /// <summary>Blocks in either direction stop new conversations/messages — it doesn't matter who blocked whom.</summary>
    private async Task EnsureNotBlockedAsync(Guid userId, Guid otherUserId, CancellationToken cancellationToken)
    {
        var blocked = await db.UserBlocks.AnyAsync(
            b => (b.BlockerId == userId && b.BlockedId == otherUserId) ||
                 (b.BlockerId == otherUserId && b.BlockedId == userId),
            cancellationToken);

        if (blocked)
        {
            throw new ForbiddenException();
        }
    }

    private async Task EnsureParticipantAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken)
    {
        var isParticipant = await db.Conversations
            .AnyAsync(c => c.Id == conversationId && (c.ParticipantAId == userId || c.ParticipantBId == userId), cancellationToken);

        if (!isParticipant)
        {
            var exists = await db.Conversations.AnyAsync(c => c.Id == conversationId, cancellationToken);
            if (!exists)
            {
                throw new NotFoundException(nameof(Conversation), conversationId);
            }

            throw new ForbiddenException();
        }
    }

    private async Task<MessageDto> BuildMessageDtoAsync(Guid messageId, CancellationToken cancellationToken)
    {
        var m = await db.Messages
            .Where(x => x.Id == messageId)
            .Select(x => new
            {
                x.Id,
                x.ConversationId,
                x.SenderId,
                SenderName = x.Sender.Name,
                SenderAvatarUrl = x.Sender.AvatarUrl,
                x.Type,
                x.Text,
                x.CreatedAt,
                x.ReadAt,
                x.SharedTaskId,
                x.SharedProjectId,
                x.ConvertedToTaskId,
            })
            .FirstAsync(cancellationToken);

        var attachments = await db.Attachments
            .Where(a => a.OwnerType == AttachmentOwnerType.Message && a.OwnerId == messageId)
            .Select(a => new AttachmentDto(a.Id, a.FileName, a.FileSize, a.MimeType, a.StorageUrl))
            .ToListAsync(cancellationToken);

        return new MessageDto(
            m.Id, m.ConversationId, m.SenderId, m.SenderName, m.SenderAvatarUrl, m.Type.ToString(), m.Text, m.CreatedAt, m.ReadAt,
            m.SharedTaskId, m.SharedProjectId, m.ConvertedToTaskId, attachments);
    }
}
