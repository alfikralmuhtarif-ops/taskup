using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Common;
using TaskUp.Application.Tasks;
using TaskUp.Application.Tasks.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("tasks")]
public class TasksController(ITaskService taskService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TaskListItemDto>>> List(
        [FromQuery] string? section, [FromQuery] Guid? projectId, [FromQuery] string? status, CancellationToken cancellationToken)
        => Ok(await taskService.ListAsync(currentUser.UserId, new TaskListQuery(section, projectId, status), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskDetailDto>> Get(Guid id, CancellationToken cancellationToken)
        => Ok(await taskService.GetAsync(currentUser.UserId, id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<TaskDetailDto>> Create(CreateTaskRequest request, CancellationToken cancellationToken)
    {
        var result = await taskService.CreateAsync(currentUser.UserId, request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<TaskDetailDto>> Update(Guid id, UpdateTaskRequest request, CancellationToken cancellationToken)
        => Ok(await taskService.UpdateAsync(currentUser.UserId, id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await taskService.DeleteAsync(currentUser.UserId, id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/status")]
    public async Task<ActionResult<TaskDetailDto>> ChangeStatus(Guid id, ChangeTaskStatusRequest request, CancellationToken cancellationToken)
        => Ok(await taskService.ChangeStatusAsync(currentUser.UserId, id, request, cancellationToken));

    [HttpPost("{id:guid}/reopen")]
    public async Task<ActionResult<TaskDetailDto>> Reopen(Guid id, CancellationToken cancellationToken)
        => Ok(await taskService.ReopenAsync(currentUser.UserId, id, cancellationToken));

    [HttpPost("{id:guid}/participants")]
    public async Task<IActionResult> AddParticipants(Guid id, AddParticipantsRequest request, CancellationToken cancellationToken)
    {
        await taskService.AddParticipantsAsync(currentUser.UserId, id, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}/participants/{userId:guid}")]
    public async Task<IActionResult> RemoveParticipant(Guid id, Guid userId, CancellationToken cancellationToken)
    {
        await taskService.RemoveParticipantAsync(currentUser.UserId, id, userId, cancellationToken);
        return NoContent();
    }

    [HttpGet("{id:guid}/updates")]
    public async Task<ActionResult<PagedResult<TaskUpdateDto>>> GetUpdates(
        Guid id, [FromQuery] DateTimeOffset? before, [FromQuery] int limit, CancellationToken cancellationToken)
        => Ok(await taskService.GetUpdatesAsync(currentUser.UserId, id, before, limit, cancellationToken));

    [HttpPost("{id:guid}/updates")]
    public async Task<ActionResult<TaskUpdateDto>> AddUpdate(Guid id, CreateTaskUpdateRequest request, CancellationToken cancellationToken)
        => Ok(await taskService.AddUpdateAsync(currentUser.UserId, id, request, cancellationToken));

    [HttpGet("{id:guid}/report")]
    public async Task<ActionResult<TaskReportDto>> GetReport(Guid id, CancellationToken cancellationToken)
        => Ok(await taskService.GetReportAsync(currentUser.UserId, id, cancellationToken));

    [HttpGet("{id:guid}/checklist-items")]
    public async Task<ActionResult<IReadOnlyList<ChecklistItemDto>>> GetChecklist(Guid id, CancellationToken cancellationToken)
        => Ok(await taskService.GetChecklistAsync(currentUser.UserId, id, cancellationToken));

    [HttpPost("{id:guid}/checklist-items")]
    public async Task<ActionResult<ChecklistItemDto>> AddChecklistItem(Guid id, CreateChecklistItemRequest request, CancellationToken cancellationToken)
        => Ok(await taskService.AddChecklistItemAsync(currentUser.UserId, id, request, cancellationToken));

    [HttpPatch("{id:guid}/checklist-items/{itemId:guid}")]
    public async Task<ActionResult<ChecklistItemDto>> UpdateChecklistItem(Guid id, Guid itemId, UpdateChecklistItemRequest request, CancellationToken cancellationToken)
        => Ok(await taskService.UpdateChecklistItemAsync(currentUser.UserId, id, itemId, request, cancellationToken));

    [HttpPost("{id:guid}/checklist-items/{itemId:guid}/complete")]
    public async Task<ActionResult<ChecklistItemDto>> CompleteChecklistItem(Guid id, Guid itemId, CancellationToken cancellationToken)
        => Ok(await taskService.CompleteChecklistItemAsync(currentUser.UserId, id, itemId, cancellationToken));

    [HttpPost("{id:guid}/checklist-items/{itemId:guid}/reopen")]
    public async Task<ActionResult<ChecklistItemDto>> ReopenChecklistItem(Guid id, Guid itemId, CancellationToken cancellationToken)
        => Ok(await taskService.ReopenChecklistItemAsync(currentUser.UserId, id, itemId, cancellationToken));

    [HttpDelete("{id:guid}/checklist-items/{itemId:guid}")]
    public async Task<IActionResult> DeleteChecklistItem(Guid id, Guid itemId, CancellationToken cancellationToken)
    {
        await taskService.DeleteChecklistItemAsync(currentUser.UserId, id, itemId, cancellationToken);
        return NoContent();
    }
}
