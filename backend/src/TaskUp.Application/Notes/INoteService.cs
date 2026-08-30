using TaskUp.Application.Notes.Dtos;

namespace TaskUp.Application.Notes;

public interface INoteService
{
    Task<IReadOnlyList<NoteListItemDto>> ListAsync(Guid userId, NoteListQuery query, CancellationToken cancellationToken = default);

    Task<NoteDetailDto> GetAsync(Guid userId, Guid noteId, CancellationToken cancellationToken = default);

    Task<NoteDetailDto> CreateAsync(Guid userId, CreateNoteRequest request, CancellationToken cancellationToken = default);

    Task<NoteDetailDto> UpdateAsync(Guid userId, Guid noteId, UpdateNoteRequest request, CancellationToken cancellationToken = default);

    /// <summary>Soft-delete — moves the note to Trash (auto-purged 30 days later).</summary>
    Task DeleteAsync(Guid userId, Guid noteId, CancellationToken cancellationToken = default);

    Task<NoteDetailDto> RestoreAsync(Guid userId, Guid noteId, CancellationToken cancellationToken = default);
}
