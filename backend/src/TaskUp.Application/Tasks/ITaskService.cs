using TaskUp.Application.Common;
using TaskUp.Application.Tasks.Dtos;

namespace TaskUp.Application.Tasks;

public interface ITaskService
{
    Task<IReadOnlyList<TaskListItemDto>> ListAsync(Guid userId, TaskListQuery query, CancellationToken cancellationToken = default);

    Task<TaskDetailDto> GetAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);

    Task<TaskDetailDto> CreateAsync(Guid userId, CreateTaskRequest request, CancellationToken cancellationToken = default);

    Task<TaskDetailDto> UpdateAsync(Guid userId, Guid taskId, UpdateTaskRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);

    Task<TaskDetailDto> ChangeStatusAsync(Guid userId, Guid taskId, ChangeTaskStatusRequest request, CancellationToken cancellationToken = default);

    Task<TaskDetailDto> ReopenAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);

    Task AddParticipantsAsync(Guid userId, Guid taskId, AddParticipantsRequest request, CancellationToken cancellationToken = default);

    Task RemoveParticipantAsync(Guid userId, Guid taskId, Guid participantUserId, CancellationToken cancellationToken = default);

    Task<PagedResult<TaskUpdateDto>> GetUpdatesAsync(Guid userId, Guid taskId, DateTimeOffset? before, int limit, CancellationToken cancellationToken = default);

    Task<TaskUpdateDto> AddUpdateAsync(Guid userId, Guid taskId, CreateTaskUpdateRequest request, CancellationToken cancellationToken = default);

    Task<TaskReportDto> GetReportAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ChecklistItemDto>> GetChecklistAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);

    Task<ChecklistItemDto> AddChecklistItemAsync(Guid userId, Guid taskId, CreateChecklistItemRequest request, CancellationToken cancellationToken = default);

    Task<ChecklistItemDto> UpdateChecklistItemAsync(Guid userId, Guid taskId, Guid itemId, UpdateChecklistItemRequest request, CancellationToken cancellationToken = default);

    Task<ChecklistItemDto> CompleteChecklistItemAsync(Guid userId, Guid taskId, Guid itemId, CancellationToken cancellationToken = default);

    Task<ChecklistItemDto> ReopenChecklistItemAsync(Guid userId, Guid taskId, Guid itemId, CancellationToken cancellationToken = default);

    Task DeleteChecklistItemAsync(Guid userId, Guid taskId, Guid itemId, CancellationToken cancellationToken = default);

    /// <summary>Latest teammates' updates across tasks the caller can see, excluding the caller's own (contract §2.2).</summary>
    Task<IReadOnlyList<ActivityFeedItemDto>> GetTeamActivityAsync(Guid userId, CancellationToken cancellationToken = default);
}
