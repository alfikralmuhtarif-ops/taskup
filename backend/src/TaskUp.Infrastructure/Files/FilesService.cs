using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Authorization;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Application.Files;
using TaskUp.Application.Files.Dtos;
using TaskUp.Domain.Shared;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Files;

public class FilesService(TaskUpDbContext db, IFileStorage fileStorage, ITaskAuthorizationService taskAuth) : IFilesService
{
    // OwnerId is polymorphic and changes meaning over the attachment's lifecycle:
    // right after upload it's a placeholder holding the uploader's own userId
    // (OwnerType = TaskUpdate), until AddUpdateAsync/SendMessageAsync re-owns it to
    // a real TaskUpdate/Message. Visibility must be checked against whichever state
    // the attachment is actually in, mirroring PostgresSearchProvider's Files scope.
    public async Task<UploadedFileDto> UploadAsync(Guid userId, Stream content, string fileName, string mimeType, CancellationToken cancellationToken = default)
    {
        var uploadResult = await fileStorage.UploadAsync(content, fileName, mimeType, cancellationToken);

        var attachment = new Attachment
        {
            Id = Guid.NewGuid(),
            // Placeholder ownership until claimed by a TaskUpdate or Message (see IFilesService).
            OwnerType = AttachmentOwnerType.TaskUpdate,
            OwnerId = userId,
            UploaderId = userId,
            FileName = fileName,
            FileSize = uploadResult.FileSize,
            MimeType = mimeType,
            StorageUrl = uploadResult.StorageUrl,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        db.Attachments.Add(attachment);
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(attachment);
    }

    public async Task<UploadedFileDto> GetAsync(Guid userId, Guid fileId, CancellationToken cancellationToken = default)
    {
        var attachment = await db.Attachments.FirstOrDefaultAsync(a => a.Id == fileId, cancellationToken)
            ?? throw new NotFoundException(nameof(Attachment), fileId);

        if (!await CanViewAsync(userId, attachment, cancellationToken))
        {
            throw new ForbiddenException();
        }

        return ToDto(attachment);
    }

    private async Task<bool> CanViewAsync(Guid userId, Attachment attachment, CancellationToken cancellationToken)
    {
        if (attachment.UploaderId == userId)
        {
            return true;
        }

        if (attachment.OwnerType == AttachmentOwnerType.TaskUpdate)
        {
            var taskId = await db.TaskUpdates
                .Where(u => u.Id == attachment.OwnerId)
                .Select(u => (Guid?)u.TaskId)
                .FirstOrDefaultAsync(cancellationToken);

            // No matching TaskUpdate means the attachment is still an unclaimed
            // placeholder (OwnerId is someone else's userId, not a TaskUpdate.Id).
            return taskId is not null && await taskAuth.UserCanAsync(userId, taskId.Value, TaskPermission.View, cancellationToken);
        }

        var conversationId = await db.Messages
            .Where(m => m.Id == attachment.OwnerId)
            .Select(m => (Guid?)m.ConversationId)
            .FirstOrDefaultAsync(cancellationToken);

        if (conversationId is null)
        {
            return false;
        }

        return await db.Conversations.AnyAsync(
            c => c.Id == conversationId.Value && (c.ParticipantAId == userId || c.ParticipantBId == userId),
            cancellationToken);
    }

    private static UploadedFileDto ToDto(Attachment attachment)
        => new(attachment.Id, attachment.FileName, attachment.FileSize, attachment.MimeType, attachment.StorageUrl);
}
