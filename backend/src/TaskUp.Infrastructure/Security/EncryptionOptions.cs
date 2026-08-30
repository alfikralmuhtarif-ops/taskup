namespace TaskUp.Infrastructure.Security;

/// <summary>
/// Keys are base64-encoded 32-byte (AES-256) values and must come from environment
/// variables / a secrets manager in any non-local environment — never commit real keys.
/// <see cref="Keys"/> is versioned so old ciphertext stays decryptable across a key rotation
/// (see the rotation runbook in SECURITY.md); new writes always use <see cref="CurrentKeyVersion"/>.
/// </summary>
public class EncryptionOptions
{
    public const string SectionName = "Encryption";

    public int CurrentKeyVersion { get; set; } = 1;

    public Dictionary<int, string> Keys { get; set; } = new();
}
