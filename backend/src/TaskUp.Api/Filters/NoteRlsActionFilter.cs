using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Api.Filters;

/// <summary>
/// Applied only to NotesController via [ServiceFilter] — wraps each request in an explicit
/// transaction and sets a Postgres session GUC ("app.current_user_id") that the Notes/Tags/
/// NoteTags row-level-security policies check. This is defense-in-depth *on top of*
/// NoteAuthorizationService's C#-level ownership checks, which remain the actually-enforced
/// boundary today: the app's Postgres role currently owns the Notes/Tags/NoteTags tables, and
/// Postgres RLS never restricts the table owner regardless of FORCE ROW LEVEL SECURITY — see
/// SECURITY.md for this caveat. Scoped to Notes only so it doesn't add transaction-per-request
/// behavior to Tasks/Projects/Chat or any other controller.
/// </summary>
public class NoteRlsActionFilter(TaskUpDbContext db, ICurrentUserService currentUser) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var cancellationToken = context.HttpContext.RequestAborted;

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        // set_config(..., true) is transaction-local (resets automatically at COMMIT/ROLLBACK),
        // so it can never leak between requests sharing a pooled connection.
        await db.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT set_config('app.current_user_id', {currentUser.UserId.ToString()}, true)",
            cancellationToken);

        var executed = await next();

        if (executed.Exception is null || executed.ExceptionHandled)
        {
            await transaction.CommitAsync(cancellationToken);
        }
        else
        {
            await transaction.RollbackAsync(cancellationToken);
        }
    }
}
