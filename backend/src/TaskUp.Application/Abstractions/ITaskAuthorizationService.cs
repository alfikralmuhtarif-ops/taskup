using TaskUp.Application.Authorization;

namespace TaskUp.Application.Abstractions;

/// <summary>
/// Implemented in Infrastructure (needs a DB round-trip to resolve the caller's
/// relationship to the task), then delegates the actual yes/no decision to the
/// pure <see cref="TaskPermissionPolicy"/>.
/// </summary>
public interface ITaskAuthorizationService
{
    Task<bool> UserCanAsync(Guid userId, Guid taskId, TaskPermission permission, CancellationToken cancellationToken = default);

    /// <summary>Throws <see cref="Common.Exceptions.ForbiddenException"/> when the check fails.</summary>
    Task EnsureUserCanAsync(Guid userId, Guid taskId, TaskPermission permission, CancellationToken cancellationToken = default);
}
