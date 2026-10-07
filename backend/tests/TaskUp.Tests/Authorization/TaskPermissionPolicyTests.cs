using TaskUp.Application.Authorization;

namespace TaskUp.Tests.Authorization;

/// <summary>
/// Pins the whole D7 task permission matrix (final-domain-model.md §11) plus the two
/// locked inference rules (§12.4, §12.5), one assertion per role/permission pair rather
/// than a few sampled cases — because the failure mode here is silent. A widened
/// permission does not throw or log; it just lets the wrong person delete someone
/// else's task, and nothing in the system notices.
///
/// The policy is a pure function over a plain record, so none of this needs a database.
/// </summary>
public class TaskPermissionPolicyTests
{
    private static readonly Guid Creator = Guid.Parse("00000000-0000-0000-0000-00000000C0DE");
    private static readonly Guid Owner = Guid.Parse("00000000-0000-0000-0000-00000000011E");
    private static readonly Guid Participant = Guid.Parse("00000000-0000-0000-0000-0000000000A1");
    private static readonly Guid ProjectMember = Guid.Parse("00000000-0000-0000-0000-0000000000B2");
    private static readonly Guid Stranger = Guid.Parse("00000000-0000-0000-0000-0000000000FF");

    /// <summary>A task owned, participated in, and inside a project — so every role is
    /// represented by a different user and the cases cannot mask one another.</summary>
    private static TaskAccessContext Context(bool requesterIsProjectMember = false) =>
        new(
            TaskId: Guid.NewGuid(),
            CreatedById: Creator,
            OwnerId: Owner,
            ParticipantIds: [Participant],
            RequesterIsProjectMember: requesterIsProjectMember);

    // ── Creator: everything ──────────────────────────────────────────────────
    [Theory]
    [InlineData(TaskPermission.View)]
    [InlineData(TaskPermission.AddUpdate)]
    [InlineData(TaskPermission.ChangeStatus)]
    [InlineData(TaskPermission.ManageChecklist)]
    [InlineData(TaskPermission.ManageParticipants)]
    [InlineData(TaskPermission.ReassignOwner)]
    [InlineData(TaskPermission.EditSettings)]
    [InlineData(TaskPermission.Delete)]
    public void Creator_HasEveryPermission(TaskPermission permission)
    {
        Assert.True(TaskPermissionPolicy.HasPermission(Context(), Creator, permission));
    }

    // ── Owner: may run the task, may not restructure it ──────────────────────
    [Theory]
    [InlineData(TaskPermission.View)]
    [InlineData(TaskPermission.AddUpdate)]
    [InlineData(TaskPermission.ChangeStatus)]
    [InlineData(TaskPermission.ManageChecklist)]
    public void Owner_CanRunTheTask(TaskPermission permission)
    {
        Assert.True(TaskPermissionPolicy.HasPermission(Context(), Owner, permission));
    }

    /// <summary>§12.4/§12.5: the Owner is explicitly NOT allowed to add participants,
    /// hand the task to someone else, edit its settings or delete it. This is the rule
    /// most likely to be "simplified" by a future change, so it is asserted directly.</summary>
    [Theory]
    [InlineData(TaskPermission.ManageParticipants)]
    [InlineData(TaskPermission.ReassignOwner)]
    [InlineData(TaskPermission.EditSettings)]
    [InlineData(TaskPermission.Delete)]
    public void Owner_CannotRestructureTheTask(TaskPermission permission)
    {
        Assert.False(TaskPermissionPolicy.HasPermission(Context(), Owner, permission));
    }

    // ── Participant: read and comment only ───────────────────────────────────
    [Theory]
    [InlineData(TaskPermission.View)]
    [InlineData(TaskPermission.AddUpdate)]
    public void Participant_CanViewAndComment(TaskPermission permission)
    {
        Assert.True(TaskPermissionPolicy.HasPermission(Context(), Participant, permission));
    }

    /// <summary>Including ManageChecklist — §12.4 keeps checklist mutation to
    /// Creator + Owner, deliberately excluding participants.</summary>
    [Theory]
    [InlineData(TaskPermission.ChangeStatus)]
    [InlineData(TaskPermission.ManageChecklist)]
    [InlineData(TaskPermission.ManageParticipants)]
    [InlineData(TaskPermission.ReassignOwner)]
    [InlineData(TaskPermission.EditSettings)]
    [InlineData(TaskPermission.Delete)]
    public void Participant_CannotChangeTheTask(TaskPermission permission)
    {
        Assert.False(TaskPermissionPolicy.HasPermission(Context(), Participant, permission));
    }

    // ── Project member: visibility only ──────────────────────────────────────
    [Fact]
    public void ProjectMember_CanViewATaskInTheirProject()
    {
        Assert.True(TaskPermissionPolicy.HasPermission(
            Context(requesterIsProjectMember: true), ProjectMember, TaskPermission.View));
    }

    /// <summary>Membership of the surrounding project grants sight of the task and
    /// nothing else — not even commenting.</summary>
    [Theory]
    [InlineData(TaskPermission.AddUpdate)]
    [InlineData(TaskPermission.ChangeStatus)]
    [InlineData(TaskPermission.ManageChecklist)]
    [InlineData(TaskPermission.ManageParticipants)]
    [InlineData(TaskPermission.ReassignOwner)]
    [InlineData(TaskPermission.EditSettings)]
    [InlineData(TaskPermission.Delete)]
    public void ProjectMember_GetsNothingBeyondView(TaskPermission permission)
    {
        Assert.False(TaskPermissionPolicy.HasPermission(
            Context(requesterIsProjectMember: true), ProjectMember, permission));
    }

    // ── Stranger: nothing at all ─────────────────────────────────────────────
    [Theory]
    [InlineData(TaskPermission.View)]
    [InlineData(TaskPermission.AddUpdate)]
    [InlineData(TaskPermission.ChangeStatus)]
    [InlineData(TaskPermission.ManageChecklist)]
    [InlineData(TaskPermission.ManageParticipants)]
    [InlineData(TaskPermission.ReassignOwner)]
    [InlineData(TaskPermission.EditSettings)]
    [InlineData(TaskPermission.Delete)]
    public void Stranger_HasNoPermissionWhatsoever(TaskPermission permission)
    {
        Assert.False(TaskPermissionPolicy.HasPermission(Context(), Stranger, permission));
    }

    // ── Edge cases that have bitten real systems ─────────────────────────────

    /// <summary>An unassigned task must not become a free-for-all: a null OwnerId is
    /// not "everyone is the owner".</summary>
    [Fact]
    public void UnassignedTask_DoesNotGrantOwnerRightsToOthers()
    {
        var unassigned = Context() with { OwnerId = null };
        Assert.False(TaskPermissionPolicy.HasPermission(unassigned, Stranger, TaskPermission.ChangeStatus));
        Assert.False(TaskPermissionPolicy.HasPermission(unassigned, Participant, TaskPermission.ChangeStatus));
        Assert.True(TaskPermissionPolicy.HasPermission(unassigned, Creator, TaskPermission.ChangeStatus));
    }

    /// <summary>Guid.Empty is what ICurrentUserService returns when the JWT subject fails
    /// to bind — a real, previously-hit failure. It must never match a null owner.</summary>
    [Fact]
    public void EmptyUserId_MatchesNobody()
    {
        var noOwner = Context() with { OwnerId = null };
        foreach (var permission in Enum.GetValues<TaskPermission>())
        {
            Assert.False(TaskPermissionPolicy.HasPermission(noOwner, Guid.Empty, permission));
        }
    }

    /// <summary>One person can hold several roles at once; the union must apply.</summary>
    [Fact]
    public void CreatorWhoIsAlsoOwner_StillHasEverything()
    {
        var solo = Context() with { OwnerId = Creator, ParticipantIds = [Creator] };
        foreach (var permission in Enum.GetValues<TaskPermission>())
        {
            Assert.True(TaskPermissionPolicy.HasPermission(solo, Creator, permission));
        }
    }

    /// <summary>Every enum member is covered above; if someone adds a permission without
    /// extending the matrix, the switch falls through to false and this count changes.</summary>
    [Fact]
    public void EveryDefinedPermissionIsAccountedFor()
    {
        Assert.Equal(8, Enum.GetValues<TaskPermission>().Length);
    }
}
