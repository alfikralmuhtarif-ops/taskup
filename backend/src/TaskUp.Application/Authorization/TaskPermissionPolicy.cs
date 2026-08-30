namespace TaskUp.Application.Authorization;

/// <summary>
/// Pure implementation of the D7 permission matrix (final-domain-model.md §11) plus
/// the two locked inference rules (§12.4, §12.5): checklist mutation is
/// Creator + Owner only (not Participants); owner-reassignment and
/// participant-management are Creator-only (Owner cannot do either in V1).
/// No roles table, no permission-grant entities — deliberately (D7).
/// </summary>
public static class TaskPermissionPolicy
{
    public static bool HasPermission(TaskAccessContext context, Guid userId, TaskPermission permission)
    {
        var isCreator = context.CreatedById == userId;
        var isOwner = context.OwnerId == userId;
        var isParticipant = context.ParticipantIds.Contains(userId);

        return permission switch
        {
            TaskPermission.View => isCreator || isOwner || isParticipant || context.RequesterIsProjectMember,
            TaskPermission.AddUpdate => isCreator || isOwner || isParticipant,
            TaskPermission.ChangeStatus => isCreator || isOwner,
            TaskPermission.ManageChecklist => isCreator || isOwner,
            TaskPermission.ManageParticipants => isCreator,
            TaskPermission.ReassignOwner => isCreator,
            TaskPermission.EditSettings => isCreator,
            TaskPermission.Delete => isCreator,
            _ => false,
        };
    }
}
