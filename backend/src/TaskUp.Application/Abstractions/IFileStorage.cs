namespace TaskUp.Application.Abstractions;

public record FileUploadResult(string StorageUrl, long FileSize, string MimeType);

/// <summary>S3-compatible object storage adapter (contract §10).</summary>
public interface IFileStorage
{
    Task<FileUploadResult> UploadAsync(
        Stream content,
        string fileName,
        string mimeType,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(string storageUrl, CancellationToken cancellationToken = default);
}
