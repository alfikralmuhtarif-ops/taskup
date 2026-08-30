using TaskUp.Domain.Identity;

namespace TaskUp.Application.Identity;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(User user);
}
