using TaskUp.Application.Authorization;

namespace TaskUp.Application.Abstractions;

public interface IProjectAuthorizationService
{
    Task<bool> UserCanAsync(Guid userId, Guid projectId, ProjectPermission permission, CancellationToken cancellationToken = default);

    /// <summary>Throws <see cref="Common.Exceptions.ForbiddenException"/> when the check fails.</summary>
    Task EnsureUserCanAsync(Guid userId, Guid projectId, ProjectPermission permission, CancellationToken cancellationToken = default);
}
