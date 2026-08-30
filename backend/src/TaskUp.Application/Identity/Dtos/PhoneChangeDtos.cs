namespace TaskUp.Application.Identity.Dtos;

public record PhoneChangeRequest(string CountryCode, string Phone);

public record PhoneChangeVerify(Guid RequestId, string Code);
