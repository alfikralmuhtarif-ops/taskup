using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TaskUp.Application.Abstractions;

namespace TaskUp.Infrastructure.Identity;

/// <summary>
/// Dev-time stand-in for a Twilio-class provider (backend-architecture.md §1) —
/// logs instead of sending. Swap for a real provider behind the same
/// <see cref="ISmsSender"/> interface for staging/production.
/// </summary>
public class LoggingSmsSender(ILogger<LoggingSmsSender> logger, IWebHostEnvironment environment) : ISmsSender
{
    public Task SendAsync(string phoneE164, string message, CancellationToken cancellationToken = default)
    {
        // Full detail (including the OTP code inside `message`) only in Development, where
        // reading this log is the whole point of this stand-in. Any other environment masks
        // both the phone and the message so OTP codes never land in real logs.
        if (environment.IsDevelopment())
        {
            logger.LogInformation("[SMS -> {Phone}] {Message}", phoneE164, message);
        }
        else
        {
            logger.LogInformation("[SMS -> {MaskedPhone}] message sent ({Length} chars)", MaskPhone(phoneE164), message.Length);
        }

        return Task.CompletedTask;
    }

    private static string MaskPhone(string phone) =>
        phone.Length <= 4 ? "****" : $"{new string('*', phone.Length - 4)}{phone[^4..]}";
}
