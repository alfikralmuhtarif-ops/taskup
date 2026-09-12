using TaskUp.Infrastructure.Identity;

namespace TaskUp.Tests.Identity;

/// <summary>
/// Guards the scoping of the temporary OTP bypass. An unscoped fixed code makes
/// every account reachable by anyone who knows its phone number, so the rule these
/// tests pin down — "the fixed code applies to listed numbers and nobody else" — is
/// the only thing standing between a test convenience and an open door.
/// </summary>
public class OtpDevOptionsTests
{
    private const string TestPhone = "+966500000000";
    private const string OtherPhone = "+966555555555";

    private static OtpDevOptions Options(string code, string phones) =>
        new() { FixedCode = code, FixedCodePhones = phones };

    [Fact]
    public void AppliesTo_ListedPhone_UsesTheFixedCode()
    {
        Assert.True(Options("123456", TestPhone).AppliesTo(TestPhone));
    }

    [Fact]
    public void AppliesTo_UnlistedPhone_DoesNot()
    {
        // The whole point: an account the operator never named stays on random codes.
        Assert.False(Options("123456", TestPhone).AppliesTo(OtherPhone));
    }

    [Fact]
    public void AppliesTo_NoFixedCode_IsAlwaysOff_EvenForAListedPhone()
    {
        Assert.False(Options("", TestPhone).AppliesTo(TestPhone));
    }

    [Fact]
    public void AppliesTo_FixedCodeButEmptyList_MatchesNobody()
    {
        // This is the configuration Program.cs refuses to start on. Even if it somehow
        // reached the issuing path, it must not fall back to "everyone".
        Assert.False(Options("123456", "").AppliesTo(TestPhone));
    }

    [Theory]
    [InlineData("+966500000000,+966555555555")]
    [InlineData("+966500000000, +966555555555")]
    [InlineData(" +966500000000 , +966555555555 ")]
    public void AllowedPhones_ParsesCommaSeparatedValues_IgnoringSurroundingSpace(string configured)
    {
        var options = Options("123456", configured);

        Assert.Equal(2, options.AllowedPhones.Count);
        Assert.True(options.AppliesTo(TestPhone));
        Assert.True(options.AppliesTo(OtherPhone));
    }

    [Fact]
    public void AllowedPhones_IgnoresEmptyEntriesFromStrayCommas()
    {
        var options = Options("123456", $",{TestPhone},,");

        Assert.Single(options.AllowedPhones);
        Assert.Equal(TestPhone, options.AllowedPhones[0]);
    }

    [Fact]
    public void IsEnabled_TreatsWhitespaceOnlyCodeAsUnset()
    {
        // "   " in .env would otherwise register as a fixed code nobody could guess
        // but which still short-circuits random generation.
        Assert.False(Options("   ", TestPhone).IsEnabled);
    }

    [Fact]
    public void Defaults_AreOff()
    {
        var options = new OtpDevOptions();

        Assert.False(options.IsEnabled);
        Assert.Empty(options.AllowedPhones);
        Assert.False(options.AppliesTo(TestPhone));
    }
}
