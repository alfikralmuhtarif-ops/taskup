using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Api.Filters;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Notes;
using TaskUp.Application.Notes.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("notes")]
[ServiceFilter(typeof(NoteRlsActionFilter))]
public class NotesController(INoteService noteService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NoteListItemDto>>> List(
        [FromQuery] string? q, [FromQuery] bool includeDeleted, CancellationToken cancellationToken)
        => Ok(await noteService.ListAsync(currentUser.UserId, new NoteListQuery(q, includeDeleted), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NoteDetailDto>> Get(Guid id, CancellationToken cancellationToken)
        => Ok(await noteService.GetAsync(currentUser.UserId, id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<NoteDetailDto>> Create(CreateNoteRequest request, CancellationToken cancellationToken)
    {
        var result = await noteService.CreateAsync(currentUser.UserId, request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<NoteDetailDto>> Update(Guid id, UpdateNoteRequest request, CancellationToken cancellationToken)
        => Ok(await noteService.UpdateAsync(currentUser.UserId, id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await noteService.DeleteAsync(currentUser.UserId, id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<ActionResult<NoteDetailDto>> Restore(Guid id, CancellationToken cancellationToken)
        => Ok(await noteService.RestoreAsync(currentUser.UserId, id, cancellationToken));
}
