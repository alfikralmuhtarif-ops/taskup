namespace TaskUp.Application.Identity.Dtos;

/// <summary>
/// IsLogin distinguishes the two entry points that were previously indistinguishable
/// server-side: "تسجيل الدخول" (login) must fail loudly for an unregistered phone rather
/// than silently creating an account, while "إنشاء حساب جديد" (register) keeps the
/// existing behavior of working either way.
/// </summary>
public record RequestOtpRequest(string CountryCode, string Phone, bool IsLogin = false);

public record RequestOtpResponse(Guid RequestId, int ExpiresInSeconds);

public record VerifyOtpRequest(Guid RequestId, string Code);

public record AuthResult(string AccessToken, string RefreshToken, bool IsNewUser);

public record RefreshRequest(string RefreshToken);
