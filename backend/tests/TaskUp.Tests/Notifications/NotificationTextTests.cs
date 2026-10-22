using TaskUp.Application.Notifications;
using TaskUp.Domain.Identity;

namespace TaskUp.Tests.Notifications;

/// <summary>
/// Notification titles were English literals written straight into the row — an
/// Arabic-first app whose notification list read "Task is overdue". These pin that every
/// template says something in both languages, since a missing case would fall through to
/// an empty title rather than fail loudly.
/// </summary>
public class NotificationTextTests
{
    public static TheoryData<NotificationTemplate> Templates => new()
    {
        NotificationTemplate.TaskAssigned,
        NotificationTemplate.TaskUpdated,
        NotificationTemplate.Mentioned,
        NotificationTemplate.TaskOverdue,
    };

    [Theory]
    [MemberData(nameof(Templates))]
    public void Render_EveryTemplate_SaysSomethingInBothLanguages(NotificationTemplate template)
    {
        var text = new NotificationText(template, "ريم الدوسري");

        Assert.False(string.IsNullOrWhiteSpace(text.Render(Language.Ar)));
        Assert.False(string.IsNullOrWhiteSpace(text.Render(Language.En)));
    }

    [Theory]
    [MemberData(nameof(Templates))]
    public void Render_TheTwoLanguagesDiffer(NotificationTemplate template)
    {
        var text = new NotificationText(template, "Reem");

        Assert.NotEqual(text.Render(Language.Ar), text.Render(Language.En));
    }

    [Theory]
    [InlineData(NotificationTemplate.TaskUpdated)]
    [InlineData(NotificationTemplate.Mentioned)]
    public void Render_TemplatesThatNameSomeone_IncludeTheActor(NotificationTemplate template)
    {
        const string actor = "محمد العتيبي";
        var text = new NotificationText(template, actor);

        Assert.Contains(actor, text.Render(Language.Ar));
        Assert.Contains(actor, text.Render(Language.En));
    }

    [Theory]
    [MemberData(nameof(Templates))]
    public void Render_Arabic_UsesNoLatinLetters(NotificationTemplate template)
    {
        // No actor here: their name is whatever they typed, so only the sentence around
        // it is ours to keep in Arabic.
        var rendered = new NotificationText(template).Render(Language.Ar);

        Assert.DoesNotContain(rendered, char.IsAsciiLetter);
    }

    /// <summary>A chat notification's title is the sender's name; there is nothing to
    /// translate, and it must survive untouched in either language.</summary>
    [Fact]
    public void Of_IsPassedThroughUnchanged()
    {
        var text = NotificationText.Of("لمى السبيعي");

        Assert.Equal("لمى السبيعي", text.Render(Language.Ar));
        Assert.Equal("لمى السبيعي", text.Render(Language.En));
    }
}
