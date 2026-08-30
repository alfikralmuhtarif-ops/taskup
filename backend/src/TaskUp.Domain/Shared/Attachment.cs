using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Shared;

/// <summary>
/// Polymorphic — one table for files attached to a TaskUpdate or a chat Message,
/// avoiding duplicate attachment tables per module.
/// </summary>
public enum AttachmentOwnerType
{
    TaskUpdate,
    Message,
}

public class Attachment
{
    public Guid Id { get; set; }

    public AttachmentOwnerType OwnerType { get; set; }

    public Guid OwnerId { get; set; }

    public Guid UploaderId { get; set; }
    public User Uploader { get; set; } = default!;

    public string FileName { get; set; } = default!;

    public long FileSize { get; set; }

    public string MimeType { get; set; } = default!;

    public string StorageUrl { get; set; } = default!;

    public DateTimeOffset CreatedAt { get; set; }
}
