using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Notifications;
using TaskUp.Application.Notifications.Dtos;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("notifications")]
public class NotificationsController(INotificationService notificationService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificationDto>>> List([FromQuery] string? filter, CancellationToken cancellationToken)
        => Ok(await notificationService.ListAsync(currentUser.UserId, filter, cancellationToken));

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        await notificationService.MarkReadAsync(currentUser.UserId, id, cancellationToken);
        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken cancellationToken)
    {
        await notificationService.MarkAllReadAsync(currentUser.UserId, cancellationToken);
        return NoContent();
    }

    [HttpGet("preferences")]
    public async Task<ActionResult<NotificationPreferencesDto>> GetPreferences(CancellationToken cancellationToken)
        => Ok(await notificationService.GetPreferencesAsync(currentUser.UserId, cancellationToken));

    [HttpPatch("preferences")]
    public async Task<ActionResult<NotificationPreferencesDto>> UpdatePreferences(UpdateNotificationPreferencesRequest request, CancellationToken cancellationToken)
        => Ok(await notificationService.UpdatePreferencesAsync(currentUser.UserId, request, cancellationToken));

    [HttpGet("delivery-settings")]
    public async Task<ActionResult<NotificationDeliverySettingsDto>> GetDeliverySettings(CancellationToken cancellationToken)
        => Ok(await notificationService.GetDeliverySettingsAsync(currentUser.UserId, cancellationToken));

    [HttpPatch("delivery-settings")]
    public async Task<ActionResult<NotificationDeliverySettingsDto>> UpdateDeliverySettings(UpdateNotificationDeliverySettingsRequest request, CancellationToken cancellationToken)
        => Ok(await notificationService.UpdateDeliverySettingsAsync(currentUser.UserId, request, cancellationToken));
}
