namespace TaskUp.Application.People.Dtos;

public record BlockedUserDto(Guid UserId, string Name, string? AvatarUrl, DateTimeOffset BlockedAt);

public record ReportUserRequest(string Reason, Guid? MessageId);
