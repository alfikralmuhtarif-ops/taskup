using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using TaskUp.Application.Abstractions;

namespace TaskUp.Api.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public Guid UserId
    {
        get
        {
            var sub = httpContextAccessor.HttpContext?.User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            return sub is not null && Guid.TryParse(sub, out var id) ? id : Guid.Empty;
        }
    }

    public bool IsAuthenticated => httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
}
