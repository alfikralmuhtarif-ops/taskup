using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Authorization;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Application.Notes;
using TaskUp.Application.Notes.Dtos;
using TaskUp.Domain.Notes;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Notes;

public class NoteService(TaskUpDbContext db, INoteAuthorizationService noteAuth, ITaskAuthorizationService taskAuth) : INoteService
{
    private const int PreviewMaxLength = 160;

    public async Task<IReadOnlyList<NoteListItemDto>> ListAsync(Guid userId, NoteListQuery query, CancellationToken cancellationToken = default)
    {
        var notes = query.IncludeDeleted
            ? db.Notes.IgnoreQueryFilters().Where(n => n.UserId == userId && n.DeletedAt != null)
            : db.Notes.Where(n => n.UserId == userId);

        var loaded = await notes
            .Include(n => n.Task)
            .ToListAsync(cancellationToken);

        // Decryption happens transparently during the materialization above — filtering on
        // Title/Content must happen here in C#, never composed into the IQueryable above,
        // since that would translate to SQL ILIKE against ciphertext and silently match nothing.
        var filtered = string.IsNullOrWhiteSpace(query.Query)
            ? loaded
            : loaded.Where(n =>
                n.Title.Contains(query.Query, StringComparison.OrdinalIgnoreCase) ||
                n.Content.Contains(query.Query, StringComparison.OrdinalIgnoreCase));

        return filtered
            .OrderByDescending(n => n.IsPinned)
            .ThenByDescending(n => n.UpdatedAt)
            .Select(ToListItemDto)
            .ToList();
    }

    public async Task<NoteDetailDto> GetAsync(Guid userId, Guid noteId, CancellationToken cancellationToken = default)
    {
        await noteAuth.EnsureOwnerAsync(userId, noteId, cancellationToken);
        var note = await LoadDetailAsync(noteId, cancellationToken);
        return ToDetailDto(note);
    }

    public async Task<NoteDetailDto> CreateAsync(Guid userId, CreateNoteRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                [nameof(request.Title)] = ["A title is required."],
            });
        }

        if (request.TaskId is not null)
        {
            await taskAuth.EnsureUserCanAsync(userId, request.TaskId.Value, TaskPermission.View, cancellationToken);
        }

        var now = DateTimeOffset.UtcNow;
        var note = new Note
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title,
            Content = request.Content ?? string.Empty,
            TaskId = request.TaskId,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.Notes.Add(note);
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(userId, note.Id, cancellationToken);
    }

    public async Task<NoteDetailDto> UpdateAsync(Guid userId, Guid noteId, UpdateNoteRequest request, CancellationToken cancellationToken = default)
    {
        await noteAuth.EnsureOwnerAsync(userId, noteId, cancellationToken);

        // Not IgnoreQueryFilters() — a soft-deleted (trashed) note can't be edited via
        // autosave; the global query filter makes this 404 naturally in that case.
        var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == noteId, cancellationToken)
            ?? throw new NotFoundException(nameof(Note), noteId);

        if (request.TaskId is not null)
        {
            await taskAuth.EnsureUserCanAsync(userId, request.TaskId.Value, TaskPermission.View, cancellationToken);
        }

        if (request.Title is not null) note.Title = request.Title;
        if (request.Content is not null) note.Content = request.Content;
        if (request.IsPinned is not null) note.IsPinned = request.IsPinned.Value;
        if (request.TaskId is not null) note.TaskId = request.TaskId;
        note.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return await GetAsync(userId, noteId, cancellationToken);
    }

    public async Task DeleteAsync(Guid userId, Guid noteId, CancellationToken cancellationToken = default)
    {
        await noteAuth.EnsureOwnerAsync(userId, noteId, cancellationToken);

        var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == noteId, cancellationToken)
            ?? throw new NotFoundException(nameof(Note), noteId);

        var now = DateTimeOffset.UtcNow;
        note.DeletedAt = now;
        note.UpdatedAt = now;
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<NoteDetailDto> RestoreAsync(Guid userId, Guid noteId, CancellationToken cancellationToken = default)
    {
        await noteAuth.EnsureOwnerAsync(userId, noteId, cancellationToken);

        var note = await db.Notes.IgnoreQueryFilters()
            .FirstOrDefaultAsync(n => n.Id == noteId && n.DeletedAt != null, cancellationToken)
            ?? throw new NotFoundException(nameof(Note), noteId);

        note.DeletedAt = null;
        note.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(userId, noteId, cancellationToken);
    }

    private async Task<Note> LoadDetailAsync(Guid noteId, CancellationToken cancellationToken)
        => await db.Notes.IgnoreQueryFilters()
            .Include(n => n.Task)
            .FirstOrDefaultAsync(n => n.Id == noteId, cancellationToken)
            ?? throw new NotFoundException(nameof(Note), noteId);

    private static NoteListItemDto ToListItemDto(Note n) => new(
        n.Id, n.Title, BuildPreview(n.Content), n.IsPinned, n.TaskId, n.Task?.Title, n.UpdatedAt);

    private static NoteDetailDto ToDetailDto(Note n) => new(
        n.Id, n.Title, n.Content, n.IsPinned, n.TaskId, n.Task?.Title, n.CreatedAt, n.UpdatedAt, n.DeletedAt);

    private static string BuildPreview(string content)
    {
        var lines = content.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var preview = string.Join(" · ", lines.Take(2));
        return preview.Length > PreviewMaxLength ? preview[..PreviewMaxLength] + "…" : preview;
    }
}
