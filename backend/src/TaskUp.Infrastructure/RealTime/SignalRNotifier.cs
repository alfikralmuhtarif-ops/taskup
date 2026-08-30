using Microsoft.AspNetCore.SignalR;
using TaskUp.Application.RealTime;

namespace TaskUp.Infrastructure.RealTime;

public class SignalRNotifier(IHubContext<NotificationsHub> hubContext) : IRealTimeNotifier
{
    public Task NotifyUserAsync(Guid userId, string eventName, object payload, CancellationToken cancellationToken = default)
        => hubContext.Clients.Group(userId.ToString()).SendAsync(eventName, payload, cancellationToken);
}
