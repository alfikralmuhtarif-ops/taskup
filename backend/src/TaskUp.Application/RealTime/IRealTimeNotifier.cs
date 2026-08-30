namespace TaskUp.Application.RealTime;

/// <summary>Push a live event to a specific user's connected clients (SignalR, backend-architecture.md §7).</summary>
public interface IRealTimeNotifier
{
    Task NotifyUserAsync(Guid userId, string eventName, object payload, CancellationToken cancellationToken = default);
}
