using TaskUp.Infrastructure.Identity;

namespace TaskUp.Tests.Identity;

/// <summary>
/// The fixed-code bypass is the one place in the service where a known string signs
/// someone in, so the half that matters is what it REFUSES. These tests pin both: that
/// a listed number is matched whatever spelling the operator used in .env, and that
/// nothing outside the list ever is.
/// </summary>
public class OtpDevOptionsTests
{
    private static OtpDevOptions With(string phones, string code = "472913") =>
        new() { FixedCode = code, FixedCodePhones = phones };

    [Theory]
    [InlineData("+966567802575")]          // exactly as normalized
    [InlineData(" +966567802575 ")]        // stray whitespace around the entry
    [InlineData("966567802575")]           // written without the plus
    [InlineData("00966567802575")]         // the 00 international prefix
    [InlineData("+966 56 780 2575")]       // spaced the way a person reads it out
    [InlineData("+966-56-780-2575")]       // hyphenated
    [InlineData("+966500000000,+966567802575")]  // second entry in a list
    public void Matches_the_listed_number_however_it_was_spelled(string configured)
    {
        Assert.True(With(configured).AppliesTo("+966567802575"));
    }

    [Theory]
    [InlineData("+966567802576")]  // one digit different
    [InlineData("+96656780257")]   // a prefix of the real number
    [InlineData("+9665678025750")] // the real number with a digit appended
    [InlineData("+1567802575")]    // same local digits, different country
    [InlineData("+966500000000")]  // a different listed-looking number
    public void Refuses_every_number_that_is_not_the_listed_one(string caller)
    {
        Assert.False(With("+966567802575").AppliesTo(caller));
    }

    [Fact]
    public void Refuses_everything_when_no_code_is_configured()
    {
        var options = With("+966567802575", code: "");
        Assert.False(options.IsEnabled);
        Assert.False(options.AppliesTo("+966567802575"));
    }

    [Theory]
    [InlineData("")]
    [InlineData(",")]
    [InlineData("   ")]
    [InlineData("+")]
    public void An_empty_or_punctuation_only_list_matches_nobody(string phones)
    {
        var options = With(phones);
        Assert.False(options.AppliesTo("+966567802575"));
        Assert.False(options.AppliesTo("+966500000000"));
    }

    /// <summary>
    /// The specific open door the normalization could have introduced: a caller whose
    /// number reduces to no digits must not be matched by an entry that also reduces
    /// to none.
    /// </summary>
    [Fact]
    public void A_caller_with_no_digits_is_never_matched()
    {
        Assert.False(With("+").AppliesTo("+"));
        Assert.False(With("++").AppliesTo(""));
    }
}
