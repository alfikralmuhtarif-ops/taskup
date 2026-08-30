using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Application.People;
using TaskUp.Application.People.Dtos;
using TaskUp.Domain.Identity;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.People;

public class PeopleService(TaskUpDbContext db, IFieldEncryptionService fieldEncryption) : IPeopleService
{
    public async Task<IReadOnlyList<PersonDto>> SearchAsync(Guid userId, string query, CancellationToken cancellationToken = default)
    {
        // An empty query intentionally falls through to the same filter below with an
        // "%{}%" pattern, which ILIKE-matches every name — this lets the mobile app's
        // participant/assignee picker show a browsable list of registered users before
        // anyone types anything, instead of an empty sheet.
        var trimmed = query.Trim();
        var pattern = $"%{trimmed}%";
        // Phone is encrypted at rest and can no longer be ILIKE-matched — only an exact
        // PhoneHash match works. Name search is unaffected.
        var looksLikePhone = trimmed.Length > 3 && trimmed.All(c => char.IsDigit(c) || c == '+');
        var phoneHash = looksLikePhone ? fieldEncryption.Hash(trimmed) : null;

        var users = await db.Users
            .Where(u => u.Id != userId && (EF.Functions.ILike(u.Name, pattern) || (phoneHash != null && u.PhoneHash == phoneHash)))
            .OrderBy(u => u.Name)
            .Take(20)
            .ToListAsync(cancellationToken);

        // Full phone numbers are only disclosed when the caller already typed the exact
        // number they're searching for (looksLikePhone/phoneHash match) — name-based
        // browsing (including the empty-query default list) gets a masked number, so this
        // endpoint can't be used to scrape every registered user's real phone number.
        return users
            .Select(u => new PersonDto(u.Id, u.Name, u.AvatarUrl, looksLikePhone ? u.Phone : MaskPhone(u.Phone)))
            .ToList();
    }

    private static string MaskPhone(string phone)
        => phone.Length <= 4 ? phone : new string('•', phone.Length - 4) + phone[^4..];

    public async Task BlockAsync(Guid userId, Guid targetUserId, CancellationToken cancellationToken = default)
    {
        if (userId == targetUserId)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["targetUserId"] = ["You can't block yourself."],
            });
        }

        var targetExists = await db.Users.AnyAsync(u => u.Id == targetUserId, cancellationToken);
        if (!targetExists)
        {
            throw new NotFoundException(nameof(User), targetUserId);
        }

        var alreadyBlocked = await db.UserBlocks
            .AnyAsync(b => b.BlockerId == userId && b.BlockedId == targetUserId, cancellationToken);
        if (alreadyBlocked)
        {
            return;
        }

        db.UserBlocks.Add(new UserBlock
        {
            Id = Guid.NewGuid(),
            BlockerId = userId,
            BlockedId = targetUserId,
            CreatedAt = DateTimeOffset.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task UnblockAsync(Guid userId, Guid targetUserId, CancellationToken cancellationToken = default)
    {
        var block = await db.UserBlocks
            .FirstOrDefaultAsync(b => b.BlockerId == userId && b.BlockedId == targetUserId, cancellationToken);
        if (block is not null)
        {
            db.UserBlocks.Remove(block);
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<IReadOnlyList<BlockedUserDto>> ListBlockedAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await db.UserBlocks
            .Where(b => b.BlockerId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BlockedUserDto(b.BlockedId, b.Blocked.Name, b.Blocked.AvatarUrl, b.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task ReportAsync(Guid reporterId, Guid targetUserId, ReportUserRequest request, CancellationToken cancellationToken = default)
    {
        if (reporterId == targetUserId)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["targetUserId"] = ["You can't report yourself."],
            });
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                [nameof(request.Reason)] = ["A reason is required."],
            });
        }

        var targetExists = await db.Users.AnyAsync(u => u.Id == targetUserId, cancellationToken);
        if (!targetExists)
        {
            throw new NotFoundException(nameof(User), targetUserId);
        }

        db.UserReports.Add(new UserReport
        {
            Id = Guid.NewGuid(),
            ReporterId = reporterId,
            ReportedUserId = targetUserId,
            Reason = request.Reason,
            MessageId = request.MessageId,
            Status = UserReportStatus.Open,
            CreatedAt = DateTimeOffset.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
    }
}
