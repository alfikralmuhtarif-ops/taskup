namespace TaskUp.Application.Abstractions;

/// <summary>OTP delivery (contract §8). V1 implementation is a Twilio-class provider adapter.</summary>
public interface ISmsSender
{
    Task SendAsync(string phoneE164, string message, CancellationToken cancellationToken = default);
}
