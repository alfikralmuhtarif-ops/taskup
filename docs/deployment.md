# TaskUp — Deployment

**Domain:** `taskupapp.net` (registered 2026-08-29)
**Status:** domain secured; hosting provider still not chosen. Everything below that depends only on the domain is done; everything that depends on a provider is listed as an open step.

---

## 1. Subdomain layout

This is the layout the code is now configured for. It is a convention, not a constraint — if you want a different split, change `Cors:AllowedOrigins`, `AllowedHosts` and `Jwt:Issuer`/`Audience` in `appsettings.Production.json` and the frontends' `VITE_API_URL` to match.

| Host | Serves | Source |
|---|---|---|
| `taskupapp.net`, `www.taskupapp.net` | Marketing / download page. **Does not exist yet** — the app's Share screen links to `https://taskupapp.net/download`, so that path needs a real page before the share link is honest | — |
| `app.taskupapp.net` | The user-facing app | `Front-end design for TaskUp/` |
| `admin.taskupapp.net` | Admin panel | `admin-panel/` |
| `api.taskupapp.net` | The API | `backend/src/TaskUp.Api` |

---

## 2. Configuration

`appsettings.Production.json` is committed and carries only non-secret, domain-derived values: `AllowedHosts`, the CORS origin list, the JWT issuer/audience, and — importantly — `Otp:FixedCode: ""`, which turns the local `111111` development backdoor back into random codes. Verified: running under `ASPNETCORE_ENVIRONMENT=Production`, `POST /auth/otp/verify` with `111111` returns `401 Incorrect code`, while the Development profile still accepts it.

Every secret is deliberately left empty in that file and **must** be supplied by the environment (or the host's secrets manager):

| Environment variable | What it is |
|---|---|
| `ConnectionStrings__Default` | Postgres connection string |
| `Jwt__SigningKey` | ≥ 32 bytes. Rotating it invalidates every issued access token |
| `Encryption__Keys__1` | Base64 AES-256 key for the field-level encryption on `User.Phone`, `Message.Text` and note title/body. **Losing this key makes that data unreadable — there is no recovery path.** If it is missing, every phone read throws `CryptographicException` and login fails with a generic 500 (see SECURITY.md §2) |
| `AdminBootstrap__Secret` | The one-time secret for `POST /admin/bootstrap`. Not a login credential — see the admin panel notes |

Double underscore is the .NET nesting separator; `Encryption__Keys__1` maps to `Encryption:Keys:1`.

### Gotcha: `dotnet run` ignores `ASPNETCORE_ENVIRONMENT`

`Properties/launchSettings.json` hard-codes `ASPNETCORE_ENVIRONMENT=Development` in both profiles, and launch profiles win over an ambient environment variable. So `ASPNETCORE_ENVIRONMENT=Production dotnet run` silently runs in **Development** — with the `111111` OTP backdoor and localhost CORS. Use `dotnet run --no-launch-profile` to test the production profile locally, and run the published binary (`dotnet TaskUp.Api.dll`) in the actual deployment, which ignores `launchSettings.json` entirely.

---

## 3. Open steps (need a hosting provider first)

- **DNS**: A/AAAA (or CNAME) records for the four hosts above.
- **TLS**: a certificate covering `taskupapp.net` and `*.taskupapp.net`. `Program.cs` already forces HTTPS redirect, HSTS (`max-age=31536000; includeSubDomains`) and TLS 1.2/1.3 only. **Do not submit to hstspreload.org until every subdomain is confirmed HTTPS-only** — preload is one-way and hard to undo.
- **Database**: managed Postgres, with `Encryption__Keys__1` stored in the provider's secrets manager, not in the image.
- **Migrations**: `dotnet ef database update` against the production connection string, from a machine that has the key.
- **Provider adapters still running as dev stubs** — each swappable behind its existing interface with no call-site changes:
  - `ISmsSender` → `LoggingSmsSender` logs the OTP instead of sending it. **The app cannot onboard a real user until this is replaced.**
  - `IFileStorage` → `LocalFileStorage` writes to local disk; needs object storage (S3/R2/etc.) before more than one instance runs.
  - `IPushSender` → `LoggingPushSender` logs instead of pushing.
  - `IAiTaskInsightProvider` → `StubAiTaskInsightProvider`, rule-based text, and no AI surface is wired into the app anyway.
- **Frontend builds**: set `VITE_API_URL=https://api.taskupapp.net` in each frontend's `.env` for the production build (both currently point at `http://localhost:5311`).

---

## 4. Native app packaging

The user app is a React/Vite web app wrapped by **Capacitor 8** — `capacitor.config.ts` at the root of `Front-end design for TaskUp/`, with both native projects committed:

| Platform | Path | State |
|---|---|---|
| iOS | `ios/App/App.xcodeproj` | **Verified building.** `xcodebuild -scheme App -sdk iphonesimulator` produces a real `App.app` bundle with bundle id `net.taskupapp.app` |
| Android | `android/` | Scaffolded and Gradle-synced, but **not compiled here** — this machine has no JDK and `ANDROID_HOME` is unset. Needs a JDK 17+ and the Android SDK to verify |

Bundle / application id is `net.taskupapp.app` (reverse of the registered domain).

**Workflow — the web build is baked into the native binary, so this order matters:**

```
npx vite build     # produce dist/
npx cap sync       # copy dist/ into ios/ and android/, refresh native deps
npx cap open ios   # or: open android
```

Forgetting `vite build` before `cap sync` ships the *previous* web build inside the app, with no error anywhere — the native equivalent of the "rebuilt but never restarted the process" mistake already recorded in SECURITY.md.

**CORS**: the webview is a cross-origin caller. iOS serves the bundle from `capacitor://localhost` and Android from `https://localhost` (`androidScheme: 'https'`); all three localhost forms are now in `Cors:AllowedOrigins` in both `appsettings.json` and `appsettings.Production.json`. Without them the native app gets a silent CORS block on every request — the same failure that once looked like "the number is invalid" during registration.

**Known gap for local native development**: iOS App Transport Security blocks cleartext HTTP, and no ATS exception was added to `Info.plist` — deliberately, since weakening transport security for a dev convenience is the wrong trade. Production is HTTPS (`https://api.taskupapp.net`) so this does not affect a real build; to point a simulator at a local `http://localhost:5311` API, add `NSAllowsLocalNetworking` to `Info.plist` locally and do not commit it.

**Still required before either store will accept a submission**: an Apple Developer account and a Google Play developer account, signing certificates and provisioning profiles, app icons and splash screens (currently Capacitor defaults), store listings and screenshots, and — for Apple — a working demo account, which is impossible until a real SMS provider replaces `LoggingSmsSender`.

---

## 5. Contact addresses used in published text

The app's in-app legal text and the root `PRIVACY_POLICY.md` / `TERMS_OF_SERVICE.md` all now point to a single mailbox, **`support@taskupapp.net`**, which needs to exist before the app is submitted to either store. The in-app text previously used `legal@taskup.app`, `privacy@taskup.app` and `support@taskup.app` — a domain we do not own — and a placeholder phone number `920XXXXXXX`, which has been removed rather than shipped as a fake contact in a privacy policy. Add a real support phone number back to `src/i18n.ts` (Privacy §12, both languages) when one exists.
