using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Ai;

public enum AIFeature
{
    Summary,
    Risk,
    Suggestions,
}

/// <summary>Tracks free-trial consumption per user/feature for entitlement gating on Free plan.</summary>
public class AIFeatureTrialUsage
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public AIFeature Feature { get; set; }

    public int UsageCount { get; set; }

    public DateTimeOffset? LastUsedAt { get; set; }
}
