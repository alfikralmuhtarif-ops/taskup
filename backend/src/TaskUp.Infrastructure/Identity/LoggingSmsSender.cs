using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TaskUp.Application.Abstractions;

namespace TaskUp.Infrastructure.Identity;

/// <summary>
/// Dev-time stand-in for a real provider (backend-architecture.md §1) — logs instead
/// of sending. Registered only while <c>Authentica:ApiKey</c> is empty.
/// </summary>
public class LoggingSmsSender(ILogger<LoggingSmsSender> logger, IWebHostEnvironment environment) : ISmsSender
{
    public Task SendOtpAsync(string phoneE164, string code, CancellationToken cancellationToken = default)
    {
        // The code itself only in Development, where reading this log is the whole
        // point of the stand-in. Any other environment masks both the phone and the
        // code, so a misconfigured production never prints a working credential.
        if (environment.IsDevelopment())
        {
            logger.LogInformation("[SMS -> {Phone}] verification code {Code}", phoneE164, code);
        }
        else
        {
            logger.LogWarning(
                "No SMS provider configured — the code for {MaskedPhone} was never sent and is not logged.",
                MaskPhone(phoneE164));
        }

        return Task.CompletedTask;
    }

    private static string MaskPhone(string phone) =>
        phone.Length <= 4 ? "****" : $"{new string('*', phone.Length - 4)}{phone[^4..]}";
}
