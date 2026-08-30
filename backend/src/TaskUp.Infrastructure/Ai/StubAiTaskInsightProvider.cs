using Microsoft.EntityFrameworkCore;
using TaskUp.Application.Abstractions;
using TaskUp.Application.Common.Exceptions;
using TaskUp.Domain.Tasks;
using TaskUp.Infrastructure.Persistence;
using DomainTaskStatus = TaskUp.Domain.Tasks.TaskStatus;

namespace TaskUp.Infrastructure.Ai;

/// <summary>
/// Dev-time stand-in for the real LLM-backed provider (backend-architecture.md §6) —
/// produces deterministic, rule-based text from the task's own data instead of
/// calling out to a model. Swap for a real implementation behind the same
/// <see cref="IAiTaskInsightProvider"/> interface.
/// </summary>
public class StubAiTaskInsightProvider(TaskUpDbContext db) : IAiTaskInsightProvider
{
    public async Task<string> GenerateSummaryAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var task = await LoadAsync(taskId, cancellationToken);
        var progress = TaskItem.ComputeProgress(task.TotalChecklist, task.CompletedChecklist);
        var progressText = progress is null ? "no checklist yet" : $"{progress}% of checklist complete";

        var dueText = task.DueDate is null ? "no due date set" : $"due {task.DueDate:yyyy-MM-dd}";
        return $"\"{task.Title}\" is {task.Status} ({progressText}), {dueText}, with {task.UpdateCount} update(s) so far.";
    }

    public async Task<string?> DetectRiskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var task = await LoadAsync(taskId, cancellationToken);
        if (task.Status == DomainTaskStatus.Done)
        {
            return null;
        }

        var isOverdue = task.DueDate is not null && task.DueDate < DateTimeOffset.UtcNow;
        if (isOverdue)
        {
            return $"This task is overdue (was due {task.DueDate:yyyy-MM-dd}) and still marked {task.Status}.";
        }

        if (task.OwnerId is null)
        {
            return "This task has no owner assigned, so nobody is accountable for progressing it.";
        }

        if (task.TotalChecklist > 0 && task.CompletedChecklist == 0 && task.DueDate is not null && task.DueDate < DateTimeOffset.UtcNow.AddDays(2))
        {
            return "Due soon with no checklist progress yet.";
        }

        return null;
    }

    public async Task<IReadOnlyList<SuggestedAction>> GenerateSuggestionsAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var task = await LoadAsync(taskId, cancellationToken);
        var suggestions = new List<SuggestedAction>();

        if (task.TotalChecklist == 0)
        {
            suggestions.Add(new SuggestedAction("Break this task into a checklist of concrete steps"));
        }

        if (task.OwnerId is null)
        {
            suggestions.Add(new SuggestedAction("Assign an owner so someone is accountable"));
        }

        if (task.DueDate is null)
        {
            suggestions.Add(new SuggestedAction("Set a due date to keep this on track"));
        }

        if (suggestions.Count == 0)
        {
            suggestions.Add(new SuggestedAction("Post a status update for the team"));
        }

        return suggestions;
    }

    private async Task<TaskSnapshot> LoadAsync(Guid taskId, CancellationToken cancellationToken)
    {
        return await db.Tasks
            .Where(t => t.Id == taskId)
            .Select(t => new TaskSnapshot(
                t.Title, t.Status, t.OwnerId, t.DueDate,
                t.ChecklistItems.Count, t.ChecklistItems.Count(c => c.IsCompleted), t.Updates.Count))
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);
    }

    private record TaskSnapshot(string Title, DomainTaskStatus Status, Guid? OwnerId, DateTimeOffset? DueDate, int TotalChecklist, int CompletedChecklist, int UpdateCount);
}
