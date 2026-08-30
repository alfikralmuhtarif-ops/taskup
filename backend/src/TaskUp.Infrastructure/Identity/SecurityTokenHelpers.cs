using System.Security.Cryptography;
using System.Text;

namespace TaskUp.Infrastructure.Identity;

/// <summary>Codes/refresh tokens are never stored in plaintext (contract §8) — only their hash.</summary>
public static class SecurityTokenHelpers
{
    public static string GenerateNumericCode(int digits = 6)
    {
        var max = (int)Math.Pow(10, digits);
        var value = RandomNumberGenerator.GetInt32(0, max);
        return value.ToString(new string('0', digits));
    }

    public static string GenerateOpaqueToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public static string Hash(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes);
    }
}
