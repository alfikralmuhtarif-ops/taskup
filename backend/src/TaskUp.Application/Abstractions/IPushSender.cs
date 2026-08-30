namespace TaskUp.Application.Abstractions;

/// <summary>Push delivery for notifications (APNs/FCM class provider adapter).</summary>
public interface IPushSender
{
    Task SendAsync(
        IReadOnlyCollection<string> pushTokens,
        string title,
        string? body,
        IReadOnlyDictionary<string, string>? data = null,
        CancellationToken cancellationToken = default);
}
