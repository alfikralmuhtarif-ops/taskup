namespace TaskUp.Application.Files.Dtos;

public record UploadedFileDto(Guid Id, string FileName, long FileSize, string MimeType, string StorageUrl);
