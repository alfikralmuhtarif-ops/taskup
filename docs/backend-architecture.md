# TaskUp — Backend Architecture

Companion to `docs/frontend-backend-contract.md` (requirements, screen →
API traceability) and `docs/final-domain-model.md` (entity schema). This
document is the technical shape of the backend that satisfies decisions
D1–D9. No implementation has been started — this is the plan those
migrations and services will follow.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime / framework | **.NET (ASP.NET Core Web API), C#** | Confirmed by the requirement to plan around **EF Core migrations** |
| ORM | **Entity Framework Core** | Matches the domain: fully relational, no document-store needs (§0 of the contract) |
| Primary datastore | **PostgreSQL** | Relational fit, native full-text search (`tsvector`/`GIN`) for D4's search requirement, JSONB available for the few semi-structured fields (e.g. `TaskActivity.Metadata`) |
| Auth | JWT access tokens (short-lived) + opaque refresh tokens (revocable, stored server-side) | Phone+OTP only — no password infra needed at all |
| Object storage | S3-compatible bucket, signed URLs | Attachments (task files, chat files/images/voice notes) |
| Real-time | WebSocket gateway (ASP.NET Core `SignalR` fits naturally in this stack) | Required by Chat (D1) for message delivery, unread counts, live notification badges |
| Push notifications | APNs/FCM via a push abstraction | Triggered from the notification write path |
| SMS/OTP | Third-party SMS provider (Twilio-class) | OTP delivery, invite links |
| Background jobs | Hosted service / job scheduler (e.g. `Quartz.NET` or `Hangfire`) | Overdue detection, invite reconciliation, weekly email digest, AI cache refresh |

**No multi-tenancy layer.** Per contract §0, TaskUp has no
company/workspace boundary — authorization is entirely resource-membership
based (§4 below), not tenant-scoped. Do not add a `TenantId` column
anywhere; it solves a problem this product doesn't have.

---

## 2. Solution layout (modules, not file paths)

A modular-monolith shape — one deployable API, organized by domain module so
boundaries stay clean without paying for network hops between services this
product doesn't need yet:

```
TaskUp.Api            -- HTTP layer: controllers/endpoints, request/response DTOs, auth middleware
TaskUp.Domain          -- entities, enums, domain invariants (final-domain-model.md, made real)
TaskUp.Application      -- use cases / handlers per module (see §3), authorization checks
TaskUp.Infrastructure   -- EF Core DbContext + migrations, storage, SMS, push, search, AI provider adapters
TaskUp.RealTime         -- SignalR hubs for chat + live notification delivery
TaskUp.Jobs             -- background job definitions
```

Each **module** in §3 owns its own entities, application handlers, and
endpoints — cross-module reads go through the Application layer's read
models, not direct cross-module entity joins, so a module can be split out
into its own service later if it ever needs to (unlikely at this scale, but
free to keep open).

---

## 3. Modules (maps directly to contract §16 endpoint groups)

| Module | Owns | Depends on |
|---|---|---|
| **Identity** | User, Device, RefreshToken, OtpRequest, Consent | — |
| **Contacts** | Stateless contact-matching (D8) — no persisted entity | Identity |
| **People/Invites** | Invite (generic, polymorphic context) | Identity |
| **Projects** | Project, ProjectMember | Identity, People/Invites |
| **Tasks** | Task, TaskParticipant, TaskChecklistItem, TaskUpdate, TaskActivity, Mention (task-scoped) | Identity, Projects, People/Invites |
| **Files** | Attachment (polymorphic owner: TaskUpdate \| Message) | Identity |
| **Chat** | Conversation, Message, Mention (message-scoped) | Identity, Tasks (for share/convert), Projects (for share), Files |
| **Notifications** | Notification, NotificationPreference, NotificationDeliverySettings | Identity, all producers (Tasks, Projects, Chat) |
| **Search** | No owned entities — reads across Tasks/Projects/Identity/Files/Chat via `ISearchProvider` | All of the above |
| **AI (Task AI)** | Subscription, AIFeatureTrialUsage, AITaskSummary, AIRiskFlag, AISuggestion | Tasks (for context + checklist writes) |
| **Legal** | static Terms/Privacy content (versioned, not necessarily DB-backed) | — |

This grouping is what `final-domain-model.md`'s entity list is organized
under too — keep the two documents' module boundaries in sync.

---

## 4. Authorization implementation

Contract §7 / D7 defines the rules; here's how they get enforced
mechanically:

- Every mutating endpoint resolves the caller's **relationship** to the
  target resource first (`Creator | Owner | Participant | ProjectMember |
  None`) via a small policy service — not scattered ad hoc checks in
  controllers. One `TaskAuthorizationPolicy` / `ProjectAuthorizationPolicy`
  per module, called at the start of every handler.
- Visibility (`GET`) queries are **filtered at the query level**, not
  checked after fetching — a task query always joins against
  `TaskParticipant`/`ProjectMember`/creator/owner for the current user;
  there is no code path that fetches a task and then decides whether to
  return it.
- No roles table, no permission-grant entities in V1 — this is deliberate
  per D7 ("لا تنشئ نظام Roles معقدًا"). The two open sub-questions in
  contract §7 (can Owner reassign Owner; can Owner manage participants) are
  implemented as **hard-coded `false`** for now, each behind a single named
  constant so flipping the answer later is a one-line change, not a
  refactor.
- Chat conversation access is a simple `participantAId == userId ||
  participantBId == userId` check — no group logic to account for (D1).

---

## 5. Search (D4)

```csharp
public interface ISearchProvider
{
    Task<SearchResults> SearchAsync(Guid userId, string query, SearchScope scope, CancellationToken ct);
}
```

- **V1 implementation**: `PostgresSearchProvider` — `ILIKE` for short
  strings, `tsvector`/`GIN` full-text indexes on `Task.Title`,
  `Task.Description`, `Project.Name`, `Project.Description`, `User.Name`,
  `Attachment.FileName`, `Message.Text`. Each sub-query is still filtered by
  the caller's visibility (§4) before results are merged.
- **Public contract**: `GET /search?q=&types=` never changes shape when the
  provider changes — a future `AiSearchProvider` (semantic/embeddings-based)
  implements the same interface and is swapped in behind a feature flag or
  per-user entitlement check, with zero change to callers. This is the
  entire point of the abstraction — it exists so D4's "no AI search in V1"
  decision doesn't become a rewrite later.
- Result unit for Conversations is the **conversation**, not the individual
  message (contract §11) — the search query still matches against message
  text, but the response surfaces the conversation with a highlighted
  snippet.

---

## 6. AI (Task AI) — D5

Only three features get real logic in V1: **Smart Summary, Risk Detection,
Suggestions**. Everything else (AI Task Creation, Voice to Task, Meeting
Summary, Daily Manager Report, AI Project Summary, AI Search) is **future**
— no handler, no LLM call, no endpoint beyond what's already listed in
contract §16.

```csharp
public interface IAiTaskInsightProvider
{
    Task<string> GenerateSummaryAsync(Guid taskId, CancellationToken ct);
    Task<string?> DetectRiskAsync(Guid taskId, CancellationToken ct);
    Task<IReadOnlyList<SuggestedAction>> GenerateSuggestionsAsync(Guid taskId, CancellationToken ct);
}
```

- One interface, one LLM-backed implementation, called only from the three
  in-scope endpoints.
- Results are **cached** (`AITaskSummary`, `AIRiskFlag`, `AISuggestion`
  rows) — regenerated on a schedule or on-demand refresh, never generated
  synchronously on every `GET`.
- **Entitlement gate** sits in front of every call: `Subscription.status ==
  active` OR `AIFeatureTrialUsage` hasn't been consumed for that
  `(userId, feature)` pair yet. The trial *limit* itself (count vs.
  one-time vs. time-boxed) is a pending product input (contract §13) — the
  gate is written against an injected `IAiTrialPolicy` so the actual rule
  can be dropped in without touching call sites.
- Accepting a Suggestion (`POST /ai/tasks/:id/suggestions/:sid/accept`)
  calls into the **Tasks module**, not the AI module, to create the
  `TaskChecklistItem` (D2) — AI module never writes Task entities directly,
  it only proposes; Tasks module owns the mutation. Keeps the module
  boundary from §3 honest.
- No extension points are being pre-built for the Future/V2 items beyond
  "the interface above is easy to extend with a new method" — per D5,
  zero business logic for those, and that includes not over-engineering
  abstractions for features with no design yet.

---

## 7. Chat / real-time (D1)

- `Conversation` is strictly 1:1 — two FK columns
  (`ParticipantAId`/`ParticipantBId`), not a join table, since group chat is
  explicitly out of scope (D1) and a join table would be solving for a
  cardinality this product doesn't have. A unique index on the normalized
  pair (`least(a,b), greatest(a,b)`) prevents duplicate conversations
  between the same two users.
- Message types: `Text | Image | File | Voice`. Emoji are plain Unicode
  text — no separate `Emoji` message type, no reaction system (not
  requested).
- `Message.SharedTaskId` / `Message.SharedProjectId` (both nullable) back
  the Share Task / Share Project actions.
- "Convert message to Task" creates a new `Task` (Creator = the converting
  user, title defaulted from message text, editable before save) and sets
  `Message.ConvertedToTaskId` for traceability — it does **not** retroactively
  attach the whole conversation to the task; only that one message is
  linked.
- **Real-time delivery**: a SignalR hub per authenticated user
  (`/hubs/realtime`), pushing new messages, read receipts, and live
  notification events. REST remains the source of truth (`GET
  /conversations/:id/messages` for history/pagination); the hub is
  delivery-only, not a second API surface.
- Attachments on messages reuse the same `Attachment` entity and `POST
  /files` upload path as task updates (§ Files below) — no separate chat
  file pipeline.

---

## 8. Files

- `Attachment` has a polymorphic owner: `OwnerType (TaskUpdate | Message)` +
  `OwnerId`. One upload endpoint (`POST /files`), one storage bucket
  strategy, used by both Tasks and Chat.
- Files are never listed in their own screen (spec §28) but **are**
  independently queryable by task/project/uploader — needed for D4's search
  scope (Files is one of the five searchable domains) even without a
  browsing UI.
- No size/type limits specified by product yet (contract §10) — enforce a
  conservative default (e.g. 25MB) at the API layer, configurable, until
  product provides real numbers.

---

## 9. Notifications (D3)

- `NotificationPreference` is a **normalized, per-category row** table
  (`UserId, Category, Enabled`) rather than fixed boolean columns on `User`
  — chosen specifically because D3 asked for a system that "يمكن توسيعه
  مستقبلاً" (extensible). Adding a new category later is a new enum value +
  a default-seeding migration, not a schema change to an existing table.
- `NotificationDeliverySettings` (one row per user: `Sound, Vibration,
  Preview, WeeklyEmail`) is separate — these aren't categories, they're
  delivery-channel toggles that apply across all categories.
- Every write to `Notification` checks the recipient's
  `NotificationPreference` for that category before deciding whether to
  push; `Sound`/`Vibration`/`Preview` are client-rendering hints delivered
  alongside the notification payload, not server-side filters.
- **Open item carried from the contract**: no "new chat message" category
  was named in D3's list even though Chat is now in V1. Recommend adding
  `NotificationCategory.NewMessage` for consistency — flagged for product
  confirmation, not yet implemented as a default-on assumption.

---

## 10. Background jobs

| Job | Trigger | Purpose |
|---|---|---|
| Overdue sweep | Scheduled (e.g. every 15 min) | Recomputes which tasks are "late" for Home's overdue section; fires `TaskOverdue` notifications on transition |
| Due-soon reminder | Scheduled (daily) | Fires `DueDateOverdue`-category reminders ahead of a task's due date |
| Invite reconciliation | Event-driven, on `POST /auth/otp/verify` when `isNewUser` | Resolves any `Invite` rows matching the new user's phone number, attaches them to the relevant Task/Project (D8) |
| Weekly email digest | Scheduled (weekly) | Only for users with `NotificationDeliverySettings.WeeklyEmail = true` |
| AI cache refresh | Scheduled or on-demand | Regenerates `AITaskSummary`/`AIRiskFlag` for active tasks, respecting entitlement |
| Push fan-out | Event-driven, on `Notification` insert | Delivers via APNs/FCM if the category + delivery settings allow |

---

## 11. What this architecture deliberately does NOT build (V1)

Mirrors contract §14 — stated here too so a reviewer of this document alone
gets the same picture:

- No WebRTC / audio / video calling, no meetings, no recording, no
  transcription (D6).
- No group chat, channels, stories, or "status" (D1).
- No AI Task Creation, Voice-to-Task, Meeting Summary, Daily Manager Report,
  AI Project Summary, or AI Search business logic — interfaces above leave
  room to add them later without a rewrite, but nothing is implemented (D5).
- No roles/permission-grant engine — fixed Creator/Owner/Participant/Member
  rules only (D7).
- No tenant/workspace layer (contract §0).
- No polls (dropped from the original chat prototype, not in D1's approved
  list).

---

*This architecture has not been implemented. It is the agreed shape to build
against once `docs/final-domain-model.md` is confirmed.*
