using TaskUp.Application.Abstractions;

namespace TaskUp.Infrastructure.Files;

/// <summary>
/// Dev-time stand-in for the S3-compatible object storage adapter (backend-architecture.md §1)
/// — writes to local disk and serves via a static file mapping. Swap for a real
/// S3-compatible provider behind the same <see cref="IFileStorage"/> interface for
/// staging/production.
/// </summary>
public class LocalFileStorage(FileStorageOptions options) : IFileStorage
{
    public async Task<FileUploadResult> UploadAsync(Stream content, string fileName, string mimeType, CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(options.RootPath);

        var extension = Path.GetExtension(fileName);
        var storedName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(options.RootPath, storedName);

        await using (var fileStream = File.Create(fullPath))
        {
            await content.CopyToAsync(fileStream, cancellationToken);
        }

        var fileInfo = new FileInfo(fullPath);
        return new FileUploadResult($"{options.PublicPathPrefix}/{storedName}", fileInfo.Length, mimeType);
    }

    public Task DeleteAsync(string storageUrl, CancellationToken cancellationToken = default)
    {
        var fileName = Path.GetFileName(storageUrl);
        var fullPath = Path.Combine(options.RootPath, fileName);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }
}

public class FileStorageOptions
{
    public const string SectionName = "FileStorage";

    public string RootPath { get; set; } = "uploads";

    public string PublicPathPrefix { get; set; } = "/uploads";
}
