using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TaskUp.Application.Abstractions;

namespace TaskUp.Infrastructure.Notifications;

/// <summary>Dev-time stand-in for an APNs/FCM-class provider — logs instead of pushing.</summary>
public class LoggingPushSender(ILogger<LoggingPushSender> logger, IWebHostEnvironment environment) : IPushSender
{
    public Task SendAsync(
        IReadOnlyCollection<string> pushTokens,
        string title,
        string? body,
        IReadOnlyDictionary<string, string>? data = null,
        CancellationToken cancellationToken = default)
    {
        // Title/body can contain task or message content — only logged in full for local
        // Development debugging; other environments log shape only, not content.
        if (environment.IsDevelopment())
        {
            logger.LogInformation("[PUSH -> {Count} device(s)] {Title}: {Body}", pushTokens.Count, title, body);
        }
        else
        {
            logger.LogInformation("[PUSH -> {Count} device(s)] notification sent", pushTokens.Count);
        }

        return Task.CompletedTask;
    }
}
