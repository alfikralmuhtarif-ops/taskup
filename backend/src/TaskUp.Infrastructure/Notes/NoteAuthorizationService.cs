using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Domain.Notes;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Notes;

public class NoteAuthorizationService(TaskUpDbContext db) : INoteAuthorizationService
{
    public async Task EnsureOwnerAsync(Guid userId, Guid noteId, CancellationToken cancellationToken = default)
    {
        var ownerId = await db.Notes
            .IgnoreQueryFilters()
            .Where(n => n.Id == noteId)
            .Select(n => (Guid?)n.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (ownerId is null)
        {
            throw new NotFoundException(nameof(Note), noteId);
        }

        if (ownerId != userId)
        {
            throw new ForbiddenException();
        }
    }
}
