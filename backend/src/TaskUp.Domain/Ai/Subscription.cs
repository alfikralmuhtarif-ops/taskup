using TaskUp.Domain.Identity;

namespace TaskUp.Domain.Ai;

public enum SubscriptionPlan
{
    Free,
    Pro,
}

public enum SubscriptionStatus
{
    Active,
    Expired,
    Cancelled,
}

/// <summary>Entitlement source for AI features — gates access alongside <see cref="AIFeatureTrialUsage"/>.</summary>
public class Subscription
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public SubscriptionPlan Plan { get; set; } = SubscriptionPlan.Free;

    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

    public DateTimeOffset StartedAt { get; set; }

    public DateTimeOffset? ExpiresAt { get; set; }
}
