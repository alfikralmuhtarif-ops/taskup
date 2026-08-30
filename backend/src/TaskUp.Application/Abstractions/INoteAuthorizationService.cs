namespace TaskUp.Application.Abstractions;

/// <summary>
/// Notes have exactly one owner (no participants/project-member concept like tasks), so
/// this is a plain ownership check rather than a permission-matrix policy split.
/// </summary>
public interface INoteAuthorizationService
{
    /// <summary>Throws <see cref="Common.Exceptions.NotFoundException"/> if the note doesn't
    /// exist, or <see cref="Common.Exceptions.ForbiddenException"/> if the caller isn't the owner.</summary>
    Task EnsureOwnerAsync(Guid userId, Guid noteId, CancellationToken cancellationToken = default);
}
