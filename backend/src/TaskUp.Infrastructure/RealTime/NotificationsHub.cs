using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TaskUp.Infrastructure.RealTime;

/// <summary>
/// Real-time delivery for chat messages and live notification badges
/// (backend-architecture.md §7). Each connection joins a group named after its
/// user id, so publishers can target a user without tracking connection ids.
/// </summary>
[Authorize]
public class NotificationsHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (userId is not null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }

        await base.OnConnectedAsync();
    }
}
