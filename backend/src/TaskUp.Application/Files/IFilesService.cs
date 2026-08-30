using TaskUp.Application.Files.Dtos;

namespace TaskUp.Application.Files;

public interface IFilesService
{
    /// <summary>
    /// Files are uploaded standalone and only "claimed" (re-owned to a TaskUpdate or
    /// Message) when the caller subsequently posts an update/message with this
    /// FileId — see TaskService.AddUpdateAsync / ChatService.SendMessageAsync.
    /// </summary>
    Task<UploadedFileDto> UploadAsync(Guid userId, Stream content, string fileName, string mimeType, CancellationToken cancellationToken = default);

    Task<UploadedFileDto> GetAsync(Guid userId, Guid fileId, CancellationToken cancellationToken = default);
}
