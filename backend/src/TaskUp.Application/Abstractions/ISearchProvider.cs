namespace TaskUp.Application.Abstractions;

public enum SearchScope
{
    All,
    Tasks,
    Projects,
    People,
    Files,
    Conversations,
}

public enum SearchResultType
{
    Task,
    Project,
    Person,
    File,
    Conversation,
}

/// <summary>
/// One row per match. <c>Snippet</c> carries the highlighted excerpt (for
/// Conversations this is the matching message text, but the result unit is
/// still the conversation — contract §11).
/// </summary>
public record SearchResultItem(SearchResultType Type, Guid Id, string Title, string? Snippet);

public record SearchResults(IReadOnlyList<SearchResultItem> Items);

/// <summary>
/// V1: `PostgresSearchProvider` (ILIKE / tsvector). Public contract stays
/// stable if a future semantic/AI provider is swapped in (D4).
/// </summary>
public interface ISearchProvider
{
    Task<SearchResults> SearchAsync(Guid userId, string query, SearchScope scope, CancellationToken cancellationToken = default);
}
