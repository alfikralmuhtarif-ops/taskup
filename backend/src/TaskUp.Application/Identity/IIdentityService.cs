using TaskUp.Application.Identity.Dtos;

namespace TaskUp.Application.Identity;

public interface IIdentityService
{
    Task<RequestOtpResponse> RequestOtpAsync(RequestOtpRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult> VerifyOtpAsync(VerifyOtpRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default);

    Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default);

    Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);

    Task<RequestOtpResponse> RequestPhoneChangeAsync(Guid userId, PhoneChangeRequest request, CancellationToken cancellationToken = default);

    Task<UserProfileDto> VerifyPhoneChangeAsync(Guid userId, PhoneChangeVerify request, CancellationToken cancellationToken = default);

    Task RecordConsentAsync(Guid userId, ConsentRequest request, CancellationToken cancellationToken = default);

    Task RegisterDeviceAsync(Guid userId, RegisterDeviceRequest request, CancellationToken cancellationToken = default);

    /// <summary>Stateless match — hashedContacts are never persisted (D8, contract §15.8).</summary>
    Task<ContactsSyncResponse> SyncContactsAsync(Guid userId, ContactsSyncRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Self-service account deletion. Related content the user created (tasks, messages)
    /// can't be hard-deleted without breaking other users' data (FK-Restrict throughout the
    /// schema), so this anonymizes Name/AvatarUrl/Phone, blocks login, and revokes every
    /// active session — see User.DeletedAt and SECURITY.md.
    /// </summary>
    Task DeleteAccountAsync(Guid userId, CancellationToken cancellationToken = default);
}
