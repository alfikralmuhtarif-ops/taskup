using TaskUp.Application.Authorization;
using TaskUp.Domain.Projects;

namespace TaskUp.Tests.Authorization;

/// <summary>
/// Pins the Project side of the D7 matrix (final-domain-model.md §11). Authority comes
/// entirely from the caller's ProjectMember.Role row, so the case that matters most is
/// the absent one: a null role means "not a member", and must grant nothing at all.
/// </summary>
public class ProjectPermissionPolicyTests
{
    private static ProjectAccessContext Context(ProjectRole? role) =>
        new(ProjectId: Guid.NewGuid(), CreatedById: Guid.NewGuid(), RequesterRole: role);

    // ── Owner: everything ────────────────────────────────────────────────────
    [Theory]
    [InlineData(ProjectPermission.View)]
    [InlineData(ProjectPermission.CreateTask)]
    [InlineData(ProjectPermission.EditSettings)]
    [InlineData(ProjectPermission.ManageMembers)]
    [InlineData(ProjectPermission.Delete)]
    public void Owner_HasEveryPermission(ProjectPermission permission)
    {
        Assert.True(ProjectPermissionPolicy.HasPermission(Context(ProjectRole.Owner), permission));
    }

    // ── Member: work inside the project, never reshape it ────────────────────
    [Theory]
    [InlineData(ProjectPermission.View)]
    [InlineData(ProjectPermission.CreateTask)]
    public void Member_CanWorkInsideTheProject(ProjectPermission permission)
    {
        Assert.True(ProjectPermissionPolicy.HasPermission(Context(ProjectRole.Member), permission));
    }

    [Theory]
    [InlineData(ProjectPermission.EditSettings)]
    [InlineData(ProjectPermission.ManageMembers)]
    [InlineData(ProjectPermission.Delete)]
    public void Member_CannotReshapeTheProject(ProjectPermission permission)
    {
        Assert.False(ProjectPermissionPolicy.HasPermission(Context(ProjectRole.Member), permission));
    }

    // ── Non-member: nothing, including View ──────────────────────────────────

    /// <summary>The one that protects every project in the system from every user not in
    /// it. A null role is "not a member", never a default-allow.</summary>
    [Theory]
    [InlineData(ProjectPermission.View)]
    [InlineData(ProjectPermission.CreateTask)]
    [InlineData(ProjectPermission.EditSettings)]
    [InlineData(ProjectPermission.ManageMembers)]
    [InlineData(ProjectPermission.Delete)]
    public void NonMember_HasNoPermissionWhatsoever(ProjectPermission permission)
    {
        Assert.False(ProjectPermissionPolicy.HasPermission(Context(role: null), permission));
    }

    /// <summary>Creating the project does not, by itself, grant anything — authority is
    /// the membership row. A creator without one is a non-member, and if that ever
    /// happens it is a data bug to surface, not a backdoor to leave open.</summary>
    [Fact]
    public void CreatorWithoutAMembershipRow_GetsNothing()
    {
        var creatorId = Guid.NewGuid();
        var orphaned = new ProjectAccessContext(Guid.NewGuid(), creatorId, RequesterRole: null);

        foreach (var permission in Enum.GetValues<ProjectPermission>())
        {
            Assert.False(ProjectPermissionPolicy.HasPermission(orphaned, permission));
        }
    }

    /// <summary>If a permission is added without extending the matrix, the switch falls
    /// through to false and this count changes.</summary>
    [Fact]
    public void EveryDefinedPermissionIsAccountedFor()
    {
        Assert.Equal(5, Enum.GetValues<ProjectPermission>().Length);
        Assert.Equal(2, Enum.GetValues<ProjectRole>().Length);
    }
}
