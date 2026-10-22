using TaskUp.Domain.Identity;

namespace TaskUp.Application.Notifications;

/// <summary>
/// Which sentence a notification should say. Callers name the event; the wording is
/// chosen when the notification is published, in the recipient's own language.
/// </summary>
public enum NotificationTemplate
{
    /// <summary>The title is already a proper noun (a sender's name) and is used as given.</summary>
    Verbatim,
    TaskAssigned,
    TaskUpdated,
    Mentioned,
    TaskOverdue,
}

/// <summary>
/// What a notification's title should say, before it is put into words.
///
/// <para>
/// Titles used to be English literals passed in at the call site — "Task is overdue",
/// "You were assigned a task", "{name} posted an update" — and written straight into the
/// row, so every user of an Arabic-first app read their notifications in English. The
/// language is a property of the recipient, which only the publisher knows, so the choice
/// of wording belongs there and not in Tasks or Chat.
/// </para>
/// </summary>
/// <param name="Template">The event being announced.</param>
/// <param name="Actor">The person who caused it, where the sentence names them.</param>
public sealed record NotificationText(NotificationTemplate Template, string? Actor = null)
{
    /// <summary>For a title that is a name rather than a sentence — a chat message shows
    /// who sent it, and that needs no translating.</summary>
    public static NotificationText Of(string literal) => new(NotificationTemplate.Verbatim, literal);

    public string Render(Language language)
    {
        var actor = Actor ?? string.Empty;

        return language == Language.Ar
            ? Template switch
            {
                // Arabic verbs agree with the subject's gender and we never ask for it,
                // so these are phrased around the actor rather than about them: "أضاف
                // تحديثاً" would call every woman on the team a man.
                NotificationTemplate.TaskAssigned => "أُسندت إليك مهمة",
                NotificationTemplate.TaskUpdated => $"تحديث جديد من {actor}",
                NotificationTemplate.Mentioned => $"إشارة إليك من {actor}",
                NotificationTemplate.TaskOverdue => "تأخّر موعد مهمة",
                _ => actor,
            }
            : Template switch
            {
                NotificationTemplate.TaskAssigned => "You were assigned a task",
                NotificationTemplate.TaskUpdated => $"{actor} posted an update",
                NotificationTemplate.Mentioned => $"{actor} mentioned you",
                NotificationTemplate.TaskOverdue => "Task is overdue",
                _ => actor,
            };
    }
}
