using TaskUp.Application.Projects.Dtos;
using TaskUp.Application.Tasks.Dtos;

namespace TaskUp.Application.Projects;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectDto>> ListAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<ProjectDetailDto> GetAsync(Guid userId, Guid projectId, CancellationToken cancellationToken = default);

    Task<ProjectDetailDto> CreateAsync(Guid userId, CreateProjectRequest request, CancellationToken cancellationToken = default);

    Task<ProjectDetailDto> UpdateAsync(Guid userId, Guid projectId, UpdateProjectRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid userId, Guid projectId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TaskListItemDto>> GetTasksAsync(Guid userId, Guid projectId, CancellationToken cancellationToken = default);

    Task AddMembersAsync(Guid userId, Guid projectId, AddMembersRequest request, CancellationToken cancellationToken = default);

    Task RemoveMemberAsync(Guid userId, Guid projectId, Guid memberUserId, CancellationToken cancellationToken = default);
}
