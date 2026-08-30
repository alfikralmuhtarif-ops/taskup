using TaskUp.Domain.Identity;
using TaskUp.Domain.Tasks;

namespace TaskUp.Domain.Projects;

public enum ProjectStatus
{
    Active,
    Archived,
}

public class Project
{
    public Guid Id { get; set; }

    public string Name { get; set; } = default!;

    public string? Description { get; set; }

    /// <summary>Hex swatch — purely a client-rendering hint.</summary>
    public string Color { get; set; } = "#2185C7";

    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = default!;

    public ProjectStatus Status { get; set; } = ProjectStatus.Active;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    /// <summary>Soft-delete (locked assumption, final-domain-model.md §12.2).</summary>
    public DateTimeOffset? DeletedAt { get; set; }

    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();

    /// <summary>done tasks / total tasks — always computed, never stored (D7).</summary>
    public static int? ComputeProgress(int totalTasks, int doneTasks) =>
        totalTasks == 0 ? null : (int)Math.Round(doneTasks * 100.0 / totalTasks);
}
