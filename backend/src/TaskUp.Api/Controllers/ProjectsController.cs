using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Projects;
using TaskUp.Application.Projects.Dtos;
using TaskUp.Application.Tasks.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("projects")]
public class ProjectsController(IProjectService projectService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProjectDto>>> List(CancellationToken cancellationToken)
        => Ok(await projectService.ListAsync(currentUser.UserId, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectDetailDto>> Get(Guid id, CancellationToken cancellationToken)
        => Ok(await projectService.GetAsync(currentUser.UserId, id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<ProjectDetailDto>> Create(CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var result = await projectService.CreateAsync(currentUser.UserId, request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<ProjectDetailDto>> Update(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken)
        => Ok(await projectService.UpdateAsync(currentUser.UserId, id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await projectService.DeleteAsync(currentUser.UserId, id, cancellationToken);
        return NoContent();
    }

    [HttpGet("{id:guid}/tasks")]
    public async Task<ActionResult<IReadOnlyList<TaskListItemDto>>> GetTasks(Guid id, CancellationToken cancellationToken)
        => Ok(await projectService.GetTasksAsync(currentUser.UserId, id, cancellationToken));

    [HttpPost("{id:guid}/members")]
    public async Task<IActionResult> AddMembers(Guid id, AddMembersRequest request, CancellationToken cancellationToken)
    {
        await projectService.AddMembersAsync(currentUser.UserId, id, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid id, Guid userId, CancellationToken cancellationToken)
    {
        await projectService.RemoveMemberAsync(currentUser.UserId, id, userId, cancellationToken);
        return NoContent();
    }
}
