using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskUp.Application.Abstractions;

namespace TaskUp.Api.Controllers;

[ApiController]
[Authorize]
[Route("search")]
public class SearchController(ISearchProvider searchProvider, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SearchResults>> Search([FromQuery] string q, [FromQuery] string? types, CancellationToken cancellationToken)
    {
        var scope = ParseScope(types);
        return Ok(await searchProvider.SearchAsync(currentUser.UserId, q, scope, cancellationToken));
    }

    private static SearchScope ParseScope(string? types)
    {
        if (string.IsNullOrWhiteSpace(types))
        {
            return SearchScope.All;
        }

        var first = types.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        return first switch
        {
            "tasks" => SearchScope.Tasks,
            "projects" => SearchScope.Projects,
            "people" => SearchScope.People,
            "files" => SearchScope.Files,
            "conversations" => SearchScope.Conversations,
            _ => SearchScope.All,
        };
    }
}
