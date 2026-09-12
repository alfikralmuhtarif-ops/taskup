using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Application.Identity;
using TaskUp.Application.Identity.Dtos;
using TaskUp.Domain.Identity;
using TaskUp.Domain.Invites;
using TaskUp.Domain.Projects;
using TaskUp.Domain.Tasks;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Identity;

public class IdentityService(
    TaskUpDbContext db,
    ISmsSender smsSender,
    IJwtTokenGenerator jwtTokenGenerator,
    IFieldEncryptionService fieldEncryption,
    IOptions<JwtOptions> jwtOptions,
    IOptions<OtpDevOptions> otpDevOptions) : IIdentityService
{
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;
    private readonly OtpDevOptions _otpDevOptions = otpDevOptions.Value;
    private static readonly TimeSpan OtpLifetime = TimeSpan.FromMinutes(5);

    public async Task<RequestOtpResponse> RequestOtpAsync(RequestOtpRequest request, CancellationToken cancellationToken = default)
    {
        var phone = PhoneNumberNormalizer.Normalize(request.CountryCode, request.Phone);

        if (request.IsLogin)
        {
            var phoneHash = fieldEncryption.Hash(phone);
            var exists = await db.Users.AnyAsync(u => u.PhoneHash == phoneHash, cancellationToken);
            if (!exists)
            {
                throw new NotFoundException(nameof(User), phone);
            }
        }

        var otpRequest = await CreateAndSendOtpAsync(phone, request.IsLogin ? OtpPurpose.Login : OtpPurpose.Register, cancellationToken);
        return new RequestOtpResponse(otpRequest.Id, (int)OtpLifetime.TotalSeconds);
    }

    public async Task<AuthResult> VerifyOtpAsync(VerifyOtpRequest request, CancellationToken cancellationToken = default)
    {
        // A single verify endpoint serves both entry points (RequestOtpAsync tags the OTP
        // Register or Login depending on which one the caller used) — either is a valid
        // proof of phone ownership here; the pre-existing-account check already happened
        // (or was deliberately skipped for Register) back when the OTP was requested.
        var otpRequest = await ConsumeOtpAsync(request.RequestId, request.Code, cancellationToken, OtpPurpose.Login, OtpPurpose.Register);

        var phoneHash = fieldEncryption.Hash(otpRequest.Phone);
        var user = await db.Users.FirstOrDefaultAsync(u => u.PhoneHash == phoneHash, cancellationToken);
        var isNewUser = user is null;

        if (user is null)
        {
            var now = DateTimeOffset.UtcNow;
            user = new User
            {
                Id = Guid.NewGuid(),
                Phone = otpRequest.Phone,
                PhoneHash = phoneHash,
                Name = string.Empty,
                Language = Language.Ar,
                CreatedAt = now,
                UpdatedAt = now,
            };
            db.Users.Add(user);
            await ReconcilePendingInvitesAsync(user, cancellationToken);
        }

        if (user.IsDisabled)
        {
            throw new UnauthorizedAppException("This account has been disabled.");
        }

        var (accessToken, refreshToken) = await IssueSessionAsync(user, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);

        return new AuthResult(accessToken, refreshToken, isNewUser);
    }

    public async Task<AuthResult> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default)
    {
        var hash = SecurityTokenHelpers.Hash(request.RefreshToken);
        var session = await db.Sessions
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.RefreshTokenHash == hash, cancellationToken);

        if (session is null || !session.IsActive)
        {
            throw new UnauthorizedAppException("Invalid or expired refresh token.");
        }

        if (session.User.IsDisabled)
        {
            throw new UnauthorizedAppException("This account has been disabled.");
        }

        session.RevokedAt = DateTimeOffset.UtcNow;

        var (accessToken, refreshToken) = await IssueSessionAsync(session.User, cancellationToken, session.DeviceId);
        await db.SaveChangesAsync(cancellationToken);

        return new AuthResult(accessToken, refreshToken, false);
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var hash = SecurityTokenHelpers.Hash(refreshToken);
        var session = await db.Sessions
            .FirstOrDefaultAsync(s => s.RefreshTokenHash == hash, cancellationToken);

        if (session is not null && session.RevokedAt is null)
        {
            session.RevokedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.FindAsync([userId], cancellationToken)
            ?? throw new NotFoundException(nameof(User), userId);

        return await BuildProfileAsync(user, cancellationToken);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.FindAsync([userId], cancellationToken)
            ?? throw new NotFoundException(nameof(User), userId);

        if (request.Name is not null) user.Name = request.Name;
        if (request.AvatarUrl is not null) user.AvatarUrl = request.AvatarUrl;
        if (request.Language is not null && Enum.TryParse<Language>(request.Language, true, out var lang)) user.Language = lang;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return await BuildProfileAsync(user, cancellationToken);
    }

    public async Task<RequestOtpResponse> RequestPhoneChangeAsync(Guid userId, PhoneChangeRequest request, CancellationToken cancellationToken = default)
    {
        var phone = PhoneNumberNormalizer.Normalize(request.CountryCode, request.Phone);

        var phoneHash = fieldEncryption.Hash(phone);
        var taken = await db.Users.AnyAsync(u => u.PhoneHash == phoneHash && u.Id != userId, cancellationToken);
        if (taken)
        {
            throw new ConflictException("This phone number is already in use.");
        }

        var otpRequest = await CreateAndSendOtpAsync(phone, OtpPurpose.ChangePhone, cancellationToken);
        return new RequestOtpResponse(otpRequest.Id, (int)OtpLifetime.TotalSeconds);
    }

    public async Task<UserProfileDto> VerifyPhoneChangeAsync(Guid userId, PhoneChangeVerify request, CancellationToken cancellationToken = default)
    {
        var otpRequest = await ConsumeOtpAsync(request.RequestId, request.Code, cancellationToken, OtpPurpose.ChangePhone);

        var user = await db.Users.FindAsync([userId], cancellationToken)
            ?? throw new NotFoundException(nameof(User), userId);

        user.Phone = otpRequest.Phone;
        user.PhoneHash = fieldEncryption.Hash(otpRequest.Phone);
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return await BuildProfileAsync(user, cancellationToken);
    }

    public async Task RecordConsentAsync(Guid userId, ConsentRequest request, CancellationToken cancellationToken = default)
    {
        db.Consents.Add(new Consent
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TermsVersion = request.TermsVersion,
            PrivacyVersion = request.PrivacyVersion,
            AcceptedAt = DateTimeOffset.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task RegisterDeviceAsync(Guid userId, RegisterDeviceRequest request, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<DevicePlatform>(request.Platform, true, out var platform))
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                [nameof(request.Platform)] = ["Must be 'Ios' or 'Android'."],
            });
        }

        var exists = await db.Devices.AnyAsync(
            d => d.UserId == userId && d.PushToken == request.PushToken, cancellationToken);

        if (!exists)
        {
            db.Devices.Add(new Device
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Platform = platform,
                PushToken = request.PushToken,
                CreatedAt = DateTimeOffset.UtcNow,
            });
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<ContactsSyncResponse> SyncContactsAsync(Guid userId, ContactsSyncRequest request, CancellationToken cancellationToken = default)
    {
        var hashes = request.HashedContacts.Distinct().ToArray();
        if (hashes.Length == 0)
        {
            return new ContactsSyncResponse([], 0);
        }

        // Matched against the precomputed PhoneHash column (unkeyed SHA-256 of the normalized
        // phone — see AesGcmFieldEncryptionService.Hash) rather than hashing "Phone" on the fly,
        // since that column now holds AES-GCM ciphertext and can no longer be hashed directly.
        // The client's raw contact book is never received or persisted (D8, contract §15.8);
        // `hashes` itself only lives for this request.
        var rows = await db.Database.SqlQuery<ContactMatchRow>(
            $"""
            SELECT "PhoneHash" AS "Hash", "Id" AS "UserId", "Name", "AvatarUrl"
            FROM "Users"
            WHERE "Id" != {userId}
              AND "PhoneHash" = ANY({hashes})
            """).ToListAsync(cancellationToken);

        var onApp = rows.Select(r => new ContactMatchDto(r.Hash, r.UserId, r.Name, r.AvatarUrl)).ToList();
        var inviteNeededCount = hashes.Length - rows.Select(r => r.Hash).Distinct().Count();

        return new ContactsSyncResponse(onApp, inviteNeededCount);
    }

    public async Task DeleteAccountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.FindAsync([userId], cancellationToken)
            ?? throw new NotFoundException(nameof(User), userId);

        // Anonymize rather than hard-delete: FK-Restrict relationships throughout the schema
        // mean a task/message this user created can't lose its Owner/Sender without breaking
        // other users' data. This removes the PII while leaving referential integrity intact.
        var placeholderPhone = $"deleted:{Guid.NewGuid()}";
        user.Phone = placeholderPhone;
        user.PhoneHash = fieldEncryption.Hash(placeholderPhone);
        user.Name = "Deleted User";
        user.AvatarUrl = null;
        user.IsDisabled = true;
        user.DeletedAt = DateTimeOffset.UtcNow;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        var activeSessions = await db.Sessions
            .Where(s => s.UserId == userId && s.RevokedAt == null)
            .ToListAsync(cancellationToken);
        foreach (var session in activeSessions)
        {
            session.RevokedAt = DateTimeOffset.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task<OtpRequest> CreateAndSendOtpAsync(string phone, OtpPurpose purpose, CancellationToken cancellationToken)
    {
        // Scoped bypass: only the explicitly listed test numbers get the fixed code.
        // Every other account keeps a real random one, so the bypass cannot be used
        // against a number its operator did not name.
        var code = _otpDevOptions.AppliesTo(phone)
            ? _otpDevOptions.FixedCode
            : SecurityTokenHelpers.GenerateNumericCode();
        var otpRequest = new OtpRequest
        {
            Id = Guid.NewGuid(),
            Phone = phone,
            CodeHash = SecurityTokenHelpers.Hash(code),
            Purpose = purpose,
            Attempts = 0,
            ExpiresAt = DateTimeOffset.UtcNow.Add(OtpLifetime),
            CreatedAt = DateTimeOffset.UtcNow,
        };

        db.OtpRequests.Add(otpRequest);
        await db.SaveChangesAsync(cancellationToken);

        await smsSender.SendAsync(phone, $"Your TaskUp verification code is {code}", cancellationToken);

        return otpRequest;
    }

    /// <summary>
    /// D8: "Pending invites resolve to the new user automatically at registration."
    /// Marks matching Invite rows Joined and applies their context (adds the new
    /// user as a TaskParticipant/ProjectMember); Direct invites just resolve, no
    /// further action needed since the conversation is created on first message.
    /// </summary>
    private async Task ReconcilePendingInvitesAsync(User newUser, CancellationToken cancellationToken)
    {
        // Invite.Phone is intentionally left unencrypted (short-lived, not the durable
        // profile phone — see SECURITY.md), so this can't compare against newUser.PhoneHash
        // directly; newUser.Phone is already decrypted in memory at this point.
        var pendingInvites = await db.Invites
            .Where(i => i.Phone == newUser.Phone && i.Status == InviteStatus.Pending)
            .ToListAsync(cancellationToken);

        if (pendingInvites.Count == 0)
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;

        foreach (var invite in pendingInvites)
        {
            invite.Status = InviteStatus.Joined;
            invite.JoinedAt = now;
            invite.JoinedUserId = newUser.Id;

            switch (invite.ContextType)
            {
                case InviteContextType.Task when invite.ContextId is not null:
                {
                    var alreadyParticipant = await db.TaskParticipants
                        .AnyAsync(p => p.TaskId == invite.ContextId && p.UserId == newUser.Id, cancellationToken);
                    var taskExists = await db.Tasks.AnyAsync(t => t.Id == invite.ContextId, cancellationToken);

                    if (taskExists && !alreadyParticipant)
                    {
                        db.TaskParticipants.Add(new TaskParticipant
                        {
                            Id = Guid.NewGuid(),
                            TaskId = invite.ContextId.Value,
                            UserId = newUser.Id,
                            AddedById = invite.InviterId,
                            AddedAt = now,
                        });
                    }

                    break;
                }
                case InviteContextType.Project when invite.ContextId is not null:
                {
                    var alreadyMember = await db.ProjectMembers
                        .AnyAsync(m => m.ProjectId == invite.ContextId && m.UserId == newUser.Id, cancellationToken);
                    var projectExists = await db.Projects.AnyAsync(p => p.Id == invite.ContextId, cancellationToken);

                    if (projectExists && !alreadyMember)
                    {
                        db.ProjectMembers.Add(new ProjectMember
                        {
                            Id = Guid.NewGuid(),
                            ProjectId = invite.ContextId.Value,
                            UserId = newUser.Id,
                            Role = ProjectRole.Member,
                            InvitedById = invite.InviterId,
                            JoinedAt = now,
                        });
                    }

                    break;
                }
            }
        }
    }

    private async Task<OtpRequest> ConsumeOtpAsync(Guid requestId, string code, CancellationToken cancellationToken, params OtpPurpose[] allowedPurposes)
    {
        var otpRequest = await db.OtpRequests.FirstOrDefaultAsync(o => o.Id == requestId, cancellationToken)
            ?? throw new NotFoundException(nameof(OtpRequest), requestId);

        if (!allowedPurposes.Contains(otpRequest.Purpose) || !otpRequest.IsValid)
        {
            throw new UnauthorizedAppException("This code has expired or is no longer valid.");
        }

        if (otpRequest.CodeHash != SecurityTokenHelpers.Hash(code))
        {
            otpRequest.Attempts++;
            await db.SaveChangesAsync(cancellationToken);
            throw new UnauthorizedAppException("Incorrect code.");
        }

        otpRequest.ConsumedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return otpRequest;
    }

    private async Task<(string AccessToken, string RefreshToken)> IssueSessionAsync(User user, CancellationToken cancellationToken, Guid? deviceId = null)
    {
        var refreshToken = SecurityTokenHelpers.GenerateOpaqueToken();
        var now = DateTimeOffset.UtcNow;

        db.Sessions.Add(new Session
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            RefreshTokenHash = SecurityTokenHelpers.Hash(refreshToken),
            DeviceId = deviceId,
            IssuedAt = now,
            ExpiresAt = now.AddDays(_jwtOptions.RefreshTokenDays),
        });

        var accessToken = jwtTokenGenerator.GenerateAccessToken(user);
        await Task.CompletedTask;
        return (accessToken, refreshToken);
    }

    private async Task<UserProfileDto> BuildProfileAsync(User user, CancellationToken cancellationToken)
    {
        var taskIds = await db.Tasks
            .Where(t => t.CreatedById == user.Id || t.OwnerId == user.Id || t.Participants.Any(p => p.UserId == user.Id))
            .Select(t => new { t.Id, t.Status })
            .ToListAsync(cancellationToken);

        var projectCount = await db.Projects.CountAsync(p => p.Members.Any(m => m.UserId == user.Id), cancellationToken);

        return new UserProfileDto(
            user.Id,
            user.Phone,
            user.Name,
            user.AvatarUrl,
            user.Language.ToString(),
            taskIds.Count,
            projectCount,
            taskIds.Count(t => t.Status == Domain.Tasks.TaskStatus.Done));
    }

    private record ContactMatchRow(string Hash, Guid UserId, string Name, string? AvatarUrl);
}
