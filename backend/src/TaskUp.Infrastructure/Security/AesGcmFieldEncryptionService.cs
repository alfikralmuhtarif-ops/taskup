using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using TaskUp.Application.Abstractions;

namespace TaskUp.Infrastructure.Security;

/// <summary>
/// Ciphertext format: "v{keyVersion}:{base64(nonce[12] + ciphertext + tag[16])}".
/// The version prefix lets old rows keep decrypting with a retired key during rotation
/// while every new write uses <see cref="EncryptionOptions.CurrentKeyVersion"/>.
/// </summary>
public class AesGcmFieldEncryptionService : IFieldEncryptionService
{
    private const int NonceSize = 12;
    private const int TagSize = 16;

    private readonly EncryptionOptions _options;
    private readonly Dictionary<int, byte[]> _keys;

    public AesGcmFieldEncryptionService(IOptions<EncryptionOptions> options)
    {
        _options = options.Value;
        _keys = _options.Keys.ToDictionary(kv => kv.Key, kv => Convert.FromBase64String(kv.Value));
    }

    public string Encrypt(string plaintext)
    {
        var version = _options.CurrentKeyVersion;
        var key = _keys[version];

        var nonce = RandomNumberGenerator.GetBytes(NonceSize);
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var ciphertextBytes = new byte[plaintextBytes.Length];
        var tag = new byte[TagSize];

        using (var aesGcm = new AesGcm(key, TagSize))
        {
            aesGcm.Encrypt(nonce, plaintextBytes, ciphertextBytes, tag);
        }

        var payload = new byte[NonceSize + ciphertextBytes.Length + TagSize];
        Buffer.BlockCopy(nonce, 0, payload, 0, NonceSize);
        Buffer.BlockCopy(ciphertextBytes, 0, payload, NonceSize, ciphertextBytes.Length);
        Buffer.BlockCopy(tag, 0, payload, NonceSize + ciphertextBytes.Length, TagSize);

        return $"v{version}:{Convert.ToBase64String(payload)}";
    }

    public string Decrypt(string ciphertext)
    {
        var separatorIndex = ciphertext.IndexOf(':');
        if (separatorIndex < 1 || ciphertext[0] != 'v')
        {
            throw new FormatException("Ciphertext is missing the expected key-version prefix.");
        }

        var version = int.Parse(ciphertext[1..separatorIndex]);
        if (!_keys.TryGetValue(version, out var key))
        {
            throw new InvalidOperationException($"No encryption key configured for version {version}.");
        }

        var payload = Convert.FromBase64String(ciphertext[(separatorIndex + 1)..]);
        var nonce = payload[..NonceSize];
        var tag = payload[^TagSize..];
        var ciphertextBytes = payload[NonceSize..^TagSize];
        var plaintextBytes = new byte[ciphertextBytes.Length];

        using (var aesGcm = new AesGcm(key, TagSize))
        {
            aesGcm.Decrypt(nonce, ciphertextBytes, tag, plaintextBytes);
        }

        return Encoding.UTF8.GetString(plaintextBytes);
    }

    /// <summary>
    /// Deliberately unkeyed SHA-256 (not HMAC): the contact-sync feature (D8) requires the
    /// client to independently compute the exact same hash from a normalized phone number
    /// with no shared secret, so a pepper can't be used here. Matches the plain
    /// <c>sha256(phone)</c> the raw SQL in <c>SyncContactsAsync</c> used before this column existed.
    /// </summary>
    public string Hash(string normalizedValue)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(normalizedValue));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
