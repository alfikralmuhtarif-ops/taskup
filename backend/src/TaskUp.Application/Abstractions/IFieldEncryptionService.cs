namespace TaskUp.Application.Abstractions;

/// <summary>
/// Application-level (field) encryption for sensitive columns — on top of, not instead of,
/// transport TLS and provider-level at-rest disk/DB encryption. AES-256-GCM is non-deterministic,
/// so it cannot back equality/substring queries; <see cref="Hash"/> is a separate deterministic
/// HMAC used only to build a lookup column, never to store the value itself.
/// </summary>
public interface IFieldEncryptionService
{
    string Encrypt(string plaintext);

    string Decrypt(string ciphertext);

    string Hash(string normalizedValue);
}
