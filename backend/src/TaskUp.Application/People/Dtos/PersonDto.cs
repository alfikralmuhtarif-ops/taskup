namespace TaskUp.Application.People.Dtos;

public record PersonDto(Guid Id, string Name, string? AvatarUrl, string Phone);
