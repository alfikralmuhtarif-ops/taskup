using System.Text.RegularExpressions;

namespace TaskUp.Infrastructure.Identity;

/// <summary>Produces the normalized E.164 form (contract §8) that every Phone column is stored/compared as.</summary>
public static partial class PhoneNumberNormalizer
{
    public static string Normalize(string countryCode, string phone)
    {
        var digitsCountryCode = DigitsOnly().Replace(countryCode, "");
        var digitsPhone = DigitsOnly().Replace(phone, "").TrimStart('0');
        return $"+{digitsCountryCode}{digitsPhone}";
    }

    [GeneratedRegex(@"\D")]
    private static partial Regex DigitsOnly();
}
