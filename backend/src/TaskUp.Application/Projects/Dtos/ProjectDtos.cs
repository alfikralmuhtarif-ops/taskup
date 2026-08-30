namespace TaskUp.Application.Projects.Dtos;

public record ProjectMemberDto(Guid UserId, string Name, string? AvatarUrl, string Role);

public record ProjectDto(
    Guid Id,
    string Name,
    string? Description,
    string Color,
    string Status,
    int? Progress,
    int TaskCount,
    int MemberCount,
    DateTimeOffset CreatedAt);

public record ProjectDetailDto(
    Guid Id,
    string Name,
    string? Description,
    string Color,
    string Status,
    int? Progress,
    int TaskCount,
    DateTimeOffset CreatedAt,
    IReadOnlyList<ProjectMemberDto> Members);

public record CreateProjectRequest(
    string Name,
    string? Description,
    string Color,
    IReadOnlyList<Guid>? MemberIds,
    IReadOnlyList<string>? ExternalInvites);

public record UpdateProjectRequest(string? Name, string? Description, string? Color);

public record AddMembersRequest(IReadOnlyList<Guid>? UserIds, IReadOnlyList<string>? ExternalInvites);
