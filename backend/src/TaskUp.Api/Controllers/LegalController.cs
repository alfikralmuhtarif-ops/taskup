using Microsoft.AspNetCore.Mvc;

namespace TaskUp.Api.Controllers;

public record LegalDocumentDto(string Version, string Content);

/// <summary>
/// Static, versioned legal content (backend-architecture.md §3) — not DB-backed.
/// Consent.TermsVersion/PrivacyVersion (recorded via POST /users/me/consents) are
/// checked against the Version returned here.
/// </summary>
[ApiController]
[Route("legal")]
public class LegalController : ControllerBase
{
    private const string TermsVersion = "1.0";
    private const string PrivacyVersion = "1.0";

    [HttpGet("terms")]
    public ActionResult<LegalDocumentDto> GetTerms()
        => Ok(new LegalDocumentDto(TermsVersion, "TaskUp Terms of Service — placeholder content for V1."));

    [HttpGet("privacy")]
    public ActionResult<LegalDocumentDto> GetPrivacy()
        => Ok(new LegalDocumentDto(PrivacyVersion, "TaskUp Privacy Policy — placeholder content for V1."));
}
