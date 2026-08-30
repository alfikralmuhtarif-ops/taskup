namespace TaskUp.Application.Ai.Dtos;

public record SubscriptionDto(string Plan, string Status, DateTimeOffset? ExpiresAt);

public record StartTrialRequest(string Feature);

public record AiTaskSummaryDto(string Content, DateTimeOffset GeneratedAt);

public record AiTaskRiskDto(string? Reason, DateTimeOffset? GeneratedAt);

public record AiSuggestionDto(Guid Id, string Content, string Status, DateTimeOffset GeneratedAt);
