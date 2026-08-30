using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Domain.Chat;
using TaskUp.Domain.Shared;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Search;

/// <summary>
/// V1 implementation of <see cref="ISearchProvider"/>: ILIKE across the domains named
/// in contract §11. Each sub-query is filtered by the caller's visibility before
/// results are merged — no path fetches then decides whether to return a match.
/// Phone and message-text substring matching were removed when those columns became
/// encrypted at rest (AES-GCM ciphertext can't back ILIKE); phone falls back to an
/// exact PhoneHash match, message content is no longer searchable — see SECURITY.md.
/// </summary>
public class PostgresSearchProvider(TaskUpDbContext db, IFieldEncryptionService fieldEncryption) : ISearchProvider
{
    public async Task<SearchResults> SearchAsync(Guid userId, string query, SearchScope scope, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return new SearchResults([]);
        }

        var pattern = $"%{query.Trim()}%";
        var items = new List<SearchResultItem>();

        if (scope is SearchScope.All or SearchScope.Tasks)
        {
            items.AddRange(await db.Tasks
                .Where(t =>
                    (t.CreatedById == userId || t.OwnerId == userId || t.Participants.Any(p => p.UserId == userId) ||
                     (t.ProjectId != null && t.Project!.Members.Any(m => m.UserId == userId))) &&
                    (EF.Functions.ILike(t.Title, pattern) || (t.Description != null && EF.Functions.ILike(t.Description, pattern))))
                .Take(20)
                .Select(t => new SearchResultItem(SearchResultType.Task, t.Id, t.Title, t.Description))
                .ToListAsync(cancellationToken));
        }

        if (scope is SearchScope.All or SearchScope.Projects)
        {
            items.AddRange(await db.Projects
                .Where(p => p.Members.Any(m => m.UserId == userId) &&
                    (EF.Functions.ILike(p.Name, pattern) || (p.Description != null && EF.Functions.ILike(p.Description, pattern))))
                .Take(20)
                .Select(p => new SearchResultItem(SearchResultType.Project, p.Id, p.Name, p.Description))
                .ToListAsync(cancellationToken));
        }

        if (scope is SearchScope.All or SearchScope.People)
        {
            var trimmedQuery = query.Trim();
            var looksLikePhone = trimmedQuery.Length > 3 && trimmedQuery.All(c => char.IsDigit(c) || c == '+');
            var phoneHash = looksLikePhone ? fieldEncryption.Hash(trimmedQuery) : null;

            items.AddRange(await db.Users
                .Where(u => u.Id != userId && (EF.Functions.ILike(u.Name, pattern) || (phoneHash != null && u.PhoneHash == phoneHash)))
                .Take(20)
                .Select(u => new SearchResultItem(SearchResultType.Person, u.Id, u.Name, u.Phone))
                .ToListAsync(cancellationToken));
        }

        if (scope is SearchScope.All or SearchScope.Files)
        {
            var visibleTaskIds = db.Tasks
                .Where(t => t.CreatedById == userId || t.OwnerId == userId || t.Participants.Any(p => p.UserId == userId) ||
                    (t.ProjectId != null && t.Project!.Members.Any(m => m.UserId == userId)))
                .Select(t => t.Id);

            var visibleUpdateIds = db.TaskUpdates.Where(u => visibleTaskIds.Contains(u.TaskId)).Select(u => u.Id);
            var visibleConversationIds = db.Conversations.Where(c => c.ParticipantAId == userId || c.ParticipantBId == userId).Select(c => c.Id);
            var visibleMessageIds = db.Messages.Where(m => visibleConversationIds.Contains(m.ConversationId)).Select(m => m.Id);

            items.AddRange(await db.Attachments
                .Where(a => EF.Functions.ILike(a.FileName, pattern) &&
                    ((a.OwnerType == AttachmentOwnerType.TaskUpdate && visibleUpdateIds.Contains(a.OwnerId)) ||
                     (a.OwnerType == AttachmentOwnerType.Message && visibleMessageIds.Contains(a.OwnerId))))
                .Take(20)
                .Select(a => new SearchResultItem(SearchResultType.File, a.Id, a.FileName, a.MimeType))
                .ToListAsync(cancellationToken));
        }

        if (scope is SearchScope.All or SearchScope.Conversations)
        {
            // Message.Text is encrypted at rest and can no longer be ILIKE-matched, so this
            // scope now matches by the other participant's name instead of message content.
            var matches = await db.Conversations
                .Where(c => c.ParticipantAId == userId || c.ParticipantBId == userId)
                .Select(c => new
                {
                    c.Id,
                    OtherName = c.ParticipantAId == userId ? c.ParticipantB.Name : c.ParticipantA.Name,
                    LastMessageText = c.Messages.OrderByDescending(m => m.CreatedAt).Select(m => m.Text).FirstOrDefault(),
                })
                .Where(c => EF.Functions.ILike(c.OtherName, pattern))
                .OrderByDescending(c => c.Id)
                .Take(20)
                .ToListAsync(cancellationToken);

            items.AddRange(matches
                .Select(c => new SearchResultItem(SearchResultType.Conversation, c.Id, c.OtherName, c.LastMessageText)));
        }

        return new SearchResults(items);
    }
}
