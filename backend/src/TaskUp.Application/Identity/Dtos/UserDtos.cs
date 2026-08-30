namespace TaskUp.Application.Identity.Dtos;

public record UserProfileDto(
    Guid Id,
    string Phone,
    string Name,
    string? AvatarUrl,
    string Language,
    int TaskCount,
    int ProjectCount,
    int CompletedTaskCount);

public record UpdateProfileRequest(string? Name, string? AvatarUrl, string? Language);

public record ConsentRequest(string TermsVersion, string PrivacyVersion);

public record RegisterDeviceRequest(string Platform, string PushToken);

public record ContactsSyncRequest(IReadOnlyList<string> HashedContacts);

/// <summary>MatchedHash lets the client map a match back to the local contact it sent (client-side only, never stored server-side).</summary>
public record ContactMatchDto(string MatchedHash, Guid UserId, string Name, string? AvatarUrl);

public record ContactsSyncResponse(IReadOnlyList<ContactMatchDto> OnApp, int InviteNeededCount);
