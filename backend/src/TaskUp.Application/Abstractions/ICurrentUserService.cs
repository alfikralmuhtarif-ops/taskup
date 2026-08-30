namespace TaskUp.Application.Abstractions;

/// <summary>Implemented in the Api project from the authenticated JWT principal.</summary>
public interface ICurrentUserService
{
    Guid UserId { get; }

    bool IsAuthenticated { get; }
}
