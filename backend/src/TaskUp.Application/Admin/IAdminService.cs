using TaskUp.Application.Admin.Dtos;
using TaskUp.Application.Common;

namespace TaskUp.Application.Admin;

public interface IAdminService
{
    Task<bool> BootstrapAdminAsync(BootstrapAdminRequest request, CancellationToken cancellationToken = default);

    Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken cancellationToken = default);

    Task<PagedResult<AdminUserListItemDto>> ListUsersAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default);

    /// <summary>Writes an AdminAccessLog row for <paramref name="adminUserId"/> — this is a content view, not a list.</summary>
    Task<AdminUserDetailDto> GetUserAsync(Guid userId, Guid adminUserId, CancellationToken cancellationToken = default);

    Task<AdminUserDetailDto> SetUserDisabledAsync(Guid userId, bool isDisabled, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminUserTaskDto>> GetUserTasksAsync(Guid userId, Guid adminUserId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminUserProjectDto>> GetUserProjectsAsync(Guid userId, Guid adminUserId, CancellationToken cancellationToken = default);

    Task<PagedResult<AdminTaskListItemDto>> ListTasksAsync(AdminTaskListQuery query, CancellationToken cancellationToken = default);

    Task<AdminTaskDetailDto> GetTaskAsync(Guid taskId, Guid adminUserId, CancellationToken cancellationToken = default);

    Task DeleteTaskAsync(Guid taskId, CancellationToken cancellationToken = default);

    Task RestoreTaskAsync(Guid taskId, CancellationToken cancellationToken = default);

    Task<PagedResult<AdminProjectListItemDto>> ListProjectsAsync(AdminProjectListQuery query, CancellationToken cancellationToken = default);

    Task<AdminProjectDetailDto> GetProjectAsync(Guid projectId, Guid adminUserId, CancellationToken cancellationToken = default);

    Task DeleteProjectAsync(Guid projectId, CancellationToken cancellationToken = default);

    Task RestoreProjectAsync(Guid projectId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ActivityFeedItemDto>> GetRecentActivityAsync(int limit, CancellationToken cancellationToken = default);

    Task<PagedResult<AdminReportListItemDto>> ListReportsAsync(bool includeResolved, int page, int pageSize, CancellationToken cancellationToken = default);

    Task ResolveReportAsync(Guid reportId, CancellationToken cancellationToken = default);

    Task ReopenReportAsync(Guid reportId, CancellationToken cancellationToken = default);

    /// <summary>The audit trail referenced in PRIVACY_POLICY.md — every GetUser/GetTask/GetProject call writes a row here.</summary>
    Task<PagedResult<AdminAccessLogItemDto>> ListAccessLogAsync(int page, int pageSize, CancellationToken cancellationToken = default);
}
