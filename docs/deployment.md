# TaskUp — Deployment

**Domain:** `taskupapp.net` (registered 2026-08-29)
**Status:** LIVE. The backend runs at https://api.taskupapp.net on a Hostinger VPS (130.94.120.128, Ubuntu 24.04, 1 vCPU, 2GB RAM + 3.9GB swap), deployed 2026-09-04 with `deploy/deploy.sh`. Everything below that depends only on the domain is done; everything that depends on a provider is listed as an open step.

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

**Local development against an HTTP API**: `Info.plist` carries `NSAllowsLocalNetworking`, which permits cleartext HTTP to local and link-local hosts *only* — so a simulator or device can talk to an API running on the developer's machine. It does not relax App Transport Security for the internet: the production API is reached over `https://api.taskupapp.net` and stays fully protected, and Apple accepts this key without a justification in App Review. (An earlier revision of this document said to add the key locally and never commit it; committing the narrow key is better than telling every developer to make the same untracked edit, and safer than the broader `NSAllowsArbitraryLoads` they would otherwise reach for.)

**Verified running**: the app has been built, installed and launched on an iOS simulator — it renders full-screen with the real status bar and correct safe areas.

**Still required before either store will accept a submission**: an Apple Developer account and a Google Play developer account, signing certificates and provisioning profiles, app icons and splash screens (currently Capacitor defaults), store listings and screenshots, and — for Apple — a working demo account, which is impossible until a real SMS provider replaces `LoggingSmsSender`.

---

## 5. Contact addresses used in published text

The app's in-app legal text and the root `PRIVACY_POLICY.md` / `TERMS_OF_SERVICE.md` all now point to a single mailbox, **`support@taskupapp.net`**, which needs to exist before the app is submitted to either store. The in-app text previously used `legal@taskup.app`, `privacy@taskup.app` and `support@taskup.app` — a domain we do not own — and a placeholder phone number `920XXXXXXX`, which has been removed rather than shipped as a fake contact in a privacy policy. Add a real support phone number back to `src/i18n.ts` (Privacy §12, both languages) when one exists.


---

## 6. What the first real deploy taught us

Every Dockerfile and script here was unbuilt until the first production run. Five
things broke, all fixed and committed:

| Failure | Cause |
|---|---|
| `adduser: exit code 127` | The .NET 10 runtime image ships `useradd` only, and already provides a non-root user as `$APP_UID`. |
| `libgssapi_krb5.so.2: cannot open shared object file` | Npgsql probes for GSSAPI on connect; the trimmed runtime image omits it. `libgssapi-krb5-2` is now installed in the runtime stage. |
| "API did not come up" while it was serving fine | The health probe used `Host: 127.0.0.1`, which `AllowedHosts` rejects with 400. It now sends the real host. |
| ACME challenge 403 | Certbot created the webroot directories with permissions nginx's unprivileged worker could not traverse. |
| No `Strict-Transport-Security` header | See below — the worst of the five, because nothing failed loudly. |

**The forwarded-headers trap.** `ForwardedHeadersOptions` was configured with
`KnownNetworks` and `KnownProxies` cleared, on the belief that empty means "trust
any proxy". It means the opposite: the middleware checks the peer against those
collections, finds both empty, and ignores the forwarded headers entirely. The
consequences were all silent — the app never saw a request as HTTPS, so `UseHsts`
emitted nothing, `UseHttpsRedirection` disabled itself for want of an HTTPS port,
and every client IP collapsed to the proxy's, making the per-IP OTP rate limit
global instead of per-caller. nginx's own `return 301` masked the missing app-level
redirect, so the only visible symptom was one absent response header. Docker's
private ranges are now listed explicitly.

## 7. Registration is not yet possible in production

The deploy works, but no one can create an account:

- `ISmsSender` is still `LoggingSmsSender`, which writes the code to the log
  instead of sending it.
- Production logging is set to `Warning`, and that line is `Information`, so the
  code does not even reach the log.
- Only a hash of the code is stored, so it cannot be recovered from the database.

Wiring a real SMS provider is the single remaining blocker to a usable service.
