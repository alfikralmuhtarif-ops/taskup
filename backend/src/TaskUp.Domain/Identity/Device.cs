namespace TaskUp.Domain.Identity;

public enum DevicePlatform
{
    Ios,
    Android,
}

public class Device
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public DevicePlatform Platform { get; set; }

    public string PushToken { get; set; } = default!;

    public DateTimeOffset CreatedAt { get; set; }
}
