using TaskUp.Domain.Projects;

namespace TaskUp.Application.Authorization;

/// <summary>Null <see cref="RequesterRole"/> means the caller is not a member of the project.</summary>
public record ProjectAccessContext(Guid ProjectId, Guid CreatedById, ProjectRole? RequesterRole);
