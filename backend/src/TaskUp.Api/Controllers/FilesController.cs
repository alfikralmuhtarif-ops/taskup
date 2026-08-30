using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Application.Files;
using TaskUp.Application.Files.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("files")]
public class FilesController(IFilesService filesService, ICurrentUserService currentUser) : ControllerBase
{
    private const long MaxFileSizeBytes = 25 * 1024 * 1024;

    [HttpPost]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<ActionResult<UploadedFileDto>> Upload(IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length == 0)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["file"] = ["A non-empty file is required."],
            });
        }

        await using var stream = file.OpenReadStream();
        var result = await filesService.UploadAsync(currentUser.UserId, stream, file.FileName, file.ContentType, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UploadedFileDto>> Get(Guid id, CancellationToken cancellationToken)
        => Ok(await filesService.GetAsync(currentUser.UserId, id, cancellationToken));
}
