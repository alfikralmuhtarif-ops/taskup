namespace TaskUp.Application.Invites.Dtos;

public record InviteContextDto(string Type, Guid? Id);

public record CreateInviteRequest(string Phone, string? Name, InviteContextDto Context);

public record InviteDto(Guid Id, string Phone, string? Label, string ContextType, Guid? ContextId, string Status, DateTimeOffset SentAt);
