namespace TaskUp.Infrastructure.Admin;

/// <summary>
/// One-time bootstrap secret used to promote the very first registered user to
/// system admin (POST /admin/bootstrap). Set via configuration/environment,
/// never checked into source — this is the only way an Admin gets created since
/// there is no separate admin signup flow.
/// </summary>
public class AdminBootstrapOptions
{
    public const string SectionName = "AdminBootstrap";

    public string Secret { get; set; } = string.Empty;
}
