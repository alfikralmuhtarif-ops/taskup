namespace TaskUp.Application.Abstractions;

/// <summary>
/// OTP delivery (contract §8).
///
/// <para>
/// Takes the bare code rather than a finished message because that is what the
/// provider's endpoint accepts: Authentica has no generic "send this text" route,
/// only <c>/send-otp</c>, which takes the code as a field and renders it into a
/// template approved in their portal. Passing a formatted string would mean
/// parsing the digits back out of it at the edge.
/// </para>
/// </summary>
public interface ISmsSender
{
    /// <param name="code">The numeric code itself — 4 to 12 digits, no surrounding text.</param>
    Task SendOtpAsync(string phoneE164, string code, CancellationToken cancellationToken = default);
}
