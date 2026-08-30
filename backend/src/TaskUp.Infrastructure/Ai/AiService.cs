using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Ai;
using TaskUp.Application.Ai.Dtos;
using TaskUp.Application.Authorization;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Application.Tasks.Dtos;
using TaskUp.Domain.Ai;
using TaskUp.Infrastructure.Persistence;

namespace TaskUp.Infrastructure.Ai;

public class AiService(
    TaskUpDbContext db,
    ITaskAuthorizationService taskAuth,
    IAiTaskInsightProvider insightProvider,
    IAiTrialPolicy trialPolicy) : IAiService
{
    public async Task<SubscriptionDto> GetSubscriptionAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var subscription = await db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
        return subscription is null
            ? new SubscriptionDto(SubscriptionPlan.Free.ToString(), SubscriptionStatus.Active.ToString(), null)
            : new SubscriptionDto(subscription.Plan.ToString(), subscription.Status.ToString(), subscription.ExpiresAt);
    }

    public async Task StartTrialAsync(Guid userId, StartTrialRequest request, CancellationToken cancellationToken = default)
    {
        var feature = ParseFeature(request.Feature);
        var usage = await db.AIFeatureTrialUsages.FirstOrDefaultAsync(u => u.UserId == userId && u.Feature == feature, cancellationToken);
        if (usage is null)
        {
            db.AIFeatureTrialUsages.Add(new AIFeatureTrialUsage { Id = Guid.NewGuid(), UserId = userId, Feature = feature, UsageCount = 0 });
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<SubscriptionDto> CheckoutAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        // Stub: real payment-processor integration is out of V1 scope (backend-architecture.md §11).
        // Simulates an immediate successful upgrade so the rest of the entitlement flow is testable.
        var subscription = await db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
        var now = DateTimeOffset.UtcNow;

        if (subscription is null)
        {
            subscription = new Subscription { Id = Guid.NewGuid(), UserId = userId, StartedAt = now };
            db.Subscriptions.Add(subscription);
        }

        subscription.Plan = SubscriptionPlan.Pro;
        subscription.Status = SubscriptionStatus.Active;
        subscription.ExpiresAt = now.AddDays(30);

        await db.SaveChangesAsync(cancellationToken);
        return new SubscriptionDto(subscription.Plan.ToString(), subscription.Status.ToString(), subscription.ExpiresAt);
    }

    public async Task<AiTaskSummaryDto> GetSummaryAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.View, cancellationToken);
        await EnsureEntitledAsync(userId, AIFeature.Summary, cancellationToken);

        var content = await insightProvider.GenerateSummaryAsync(taskId, cancellationToken);
        var now = DateTimeOffset.UtcNow;

        var existing = await db.AITaskSummaries.FirstOrDefaultAsync(s => s.TaskId == taskId, cancellationToken);
        if (existing is null)
        {
            db.AITaskSummaries.Add(new AITaskSummary { Id = Guid.NewGuid(), TaskId = taskId, Content = content, GeneratedAt = now });
        }
        else
        {
            existing.Content = content;
            existing.GeneratedAt = now;
        }

        await db.SaveChangesAsync(cancellationToken);
        await trialPolicy.RecordUsageAsync(userId, AIFeature.Summary, cancellationToken);

        return new AiTaskSummaryDto(content, now);
    }

    public async Task<AiTaskRiskDto> GetRiskAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.View, cancellationToken);
        await EnsureEntitledAsync(userId, AIFeature.Risk, cancellationToken);

        var reason = await insightProvider.DetectRiskAsync(taskId, cancellationToken);
        var now = DateTimeOffset.UtcNow;

        var existing = await db.AIRiskFlags.FirstOrDefaultAsync(r => r.TaskId == taskId, cancellationToken);
        if (reason is null)
        {
            if (existing is not null) db.AIRiskFlags.Remove(existing);
        }
        else if (existing is null)
        {
            db.AIRiskFlags.Add(new AIRiskFlag { Id = Guid.NewGuid(), TaskId = taskId, Level = AIRiskLevel.Medium, Reason = reason, GeneratedAt = now });
        }
        else
        {
            existing.Reason = reason;
            existing.GeneratedAt = now;
        }

        await db.SaveChangesAsync(cancellationToken);
        await trialPolicy.RecordUsageAsync(userId, AIFeature.Risk, cancellationToken);

        return new AiTaskRiskDto(reason, reason is null ? null : now);
    }

    public async Task<IReadOnlyList<AiSuggestionDto>> GetSuggestionsAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.View, cancellationToken);
        await EnsureEntitledAsync(userId, AIFeature.Suggestions, cancellationToken);

        var pending = await db.AISuggestions
            .Where(s => s.TaskId == taskId && s.Status == AISuggestionStatus.Pending)
            .ToListAsync(cancellationToken);

        if (pending.Count == 0)
        {
            var generated = await insightProvider.GenerateSuggestionsAsync(taskId, cancellationToken);
            var now = DateTimeOffset.UtcNow;

            foreach (var suggestion in generated)
            {
                var entity = new AISuggestion { Id = Guid.NewGuid(), TaskId = taskId, Content = suggestion.Content, GeneratedAt = now };
                db.AISuggestions.Add(entity);
                pending.Add(entity);
            }

            await db.SaveChangesAsync(cancellationToken);
            await trialPolicy.RecordUsageAsync(userId, AIFeature.Suggestions, cancellationToken);
        }

        return pending.Select(ToDto).ToList();
    }

    public async Task<ChecklistItemDto> AcceptSuggestionAsync(Guid userId, Guid taskId, Guid suggestionId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.ManageChecklist, cancellationToken);

        var suggestion = await db.AISuggestions.FirstOrDefaultAsync(s => s.Id == suggestionId && s.TaskId == taskId, cancellationToken)
            ?? throw new NotFoundException(nameof(AISuggestion), suggestionId);

        var now = DateTimeOffset.UtcNow;
        var sortOrder = await db.TaskChecklistItems.Where(c => c.TaskId == taskId).CountAsync(cancellationToken);

        var checklistItem = new Domain.Tasks.TaskChecklistItem
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            Title = suggestion.Content,
            SortOrder = sortOrder,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.TaskChecklistItems.Add(checklistItem);

        suggestion.Status = AISuggestionStatus.Accepted;
        suggestion.AcceptedChecklistItemId = checklistItem.Id;

        await db.SaveChangesAsync(cancellationToken);

        return new ChecklistItemDto(checklistItem.Id, checklistItem.Title, checklistItem.IsCompleted, checklistItem.SortOrder, null, null);
    }

    public async Task DismissSuggestionAsync(Guid userId, Guid taskId, Guid suggestionId, CancellationToken cancellationToken = default)
    {
        await taskAuth.EnsureUserCanAsync(userId, taskId, TaskPermission.View, cancellationToken);

        var suggestion = await db.AISuggestions.FirstOrDefaultAsync(s => s.Id == suggestionId && s.TaskId == taskId, cancellationToken)
            ?? throw new NotFoundException(nameof(AISuggestion), suggestionId);

        suggestion.Status = AISuggestionStatus.Dismissed;
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureEntitledAsync(Guid userId, AIFeature feature, CancellationToken cancellationToken)
    {
        if (!await trialPolicy.CanUseAsync(userId, feature, cancellationToken))
        {
            throw new ForbiddenException("Your free trial for this Task AI feature is used up — upgrade to Pro to continue.");
        }
    }

    private static AIFeature ParseFeature(string feature) => feature.ToLowerInvariant() switch
    {
        "summary" => AIFeature.Summary,
        "risk" => AIFeature.Risk,
        "suggestions" => AIFeature.Suggestions,
        _ => throw new ValidationAppException(new Dictionary<string, string[]>
        {
            ["feature"] = ["Must be 'summary', 'risk' or 'suggestions'."],
        }),
    };

    private static AiSuggestionDto ToDto(AISuggestion s) => new(s.Id, s.Content, s.Status.ToString(), s.GeneratedAt);
}
