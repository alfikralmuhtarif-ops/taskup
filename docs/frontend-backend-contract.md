# TaskUp — Frontend → Backend Contract

Derived from a full read of `Front-end design for TaskUp/` — the design spec
(`src/imports/pasted_text/taskup-design-spec.md`, 74 sections) **and** the coded
Figma Make prototype (`src/App.tsx`, 3358 lines + `src/i18n.ts`, 622 lines).

Both sources were read in full. Where the coded prototype diverges from the
written spec, both are recorded — the spec is the intent, the code is the
most concrete signal of what was actually built. The most significant
divergence was Chat (fully implemented in code, absent from and arguably
contradicting the written spec's design philosophy); this has since been
resolved by explicit product decision — see the decisions log immediately
below.

This document does not propose implementation code. It exists to convert the
frontend into precise backend requirements before any backend is written.

> **Status: decisions applied (2026-08-09).** Every open ambiguity raised in
> the original review (§15) has now been resolved by explicit product
> decision, recorded below and cross-referenced throughout. The full
> resulting entity schema lives in `docs/final-domain-model.md` (authoritative
> — do not treat the entity sketch further down in this file as current) and
> the full technical architecture lives in `docs/backend-architecture.md`.
> This file remains the requirements/traceability document: screen → data →
> action → API.

---

## Decisions log (resolves §15)

| # | Decision | Resolves |
|---|---|---|
| D1 | **Chat is in V1**, but scoped down to simple 1:1 only: text, images, files, voice notes, emoji (as plain text), mentions, share-a-task, share-a-project, convert-message-to-task. **Explicitly excluded**: group chat, voice/video calls, meetings, stories, channels, status. Purpose is work-adjacent communication, not a general messenger. | §15.1 |
| D2 | **No standalone Subtask entity.** A `TaskChecklistItem` (Id, TaskId, Title, IsCompleted, CompletedById, CompletedAt, SortOrder, CreatedAt, UpdatedAt) lives directly under Task — no members, no participants, no chat, no independent permissions, no independent due date. **Task progress = completed checklist items / total checklist items.** If a task has no checklist, progress is not a fabricated percentage — it is either omitted or reported as "no checklist" (client decides how to render that; backend must not invent a number). | §15.2, §15.4 (also resolves the AI "Add action" target — see D5) |
| D3 | **Notification settings follow the shipped Frontend model, not the spec's two-tier priority text**: Task Assigned, Task Updated, Mention, Due Date/Overdue, Project Updates — plus delivery-level Sound, Vibration, Preview, Weekly Email. Modeled as an extensible category list (see `final-domain-model.md`) so new categories don't require a schema migration. | §15.3 |
| D4 | **Search is in V1** as unified basic search across Tasks, Projects, People, Files, Conversations, using Postgres `ILIKE`/full-text search. AI Search is explicitly **out of V1** — build behind a swappable `ISearchProvider` abstraction so it can be added later without changing the public `/search` contract. | §15.5, §11 |
| D5 | **AI in V1 is limited to features with an actual designed screen**: Smart Summary, Risk Detection, Suggestions (§33–35). Suggestion "Add action" now has a defined target: **it creates a `TaskChecklistItem`** (resolves the old undefined-target gap). Everything else named in the spec's paywall list (AI Task Creation, Voice to Task, Meeting Summary, Daily Manager Report, AI Project Summary, AI Search) is **Future/V2** — architecture may reserve extension points, but zero business logic is built now. | §13, §14, §15.4 |
| D6 | **Calls & Meetings are out of scope entirely for V1** (no WebRTC, audio/video calls, recording, transcription). V2 concern, not modeled at all right now. | new — closes off a risk area chat scoping (D1) could otherwise have implied |
| D7 | **Simple, fixed permission model** (no roles engine) — see the updated §7 and the full matrix in `final-domain-model.md`. Task: Creator edits settings; Owner (renamed from "assignee/المسؤول") updates & executes the task; Participants add updates/files only; changing Owner and deleting the task are Creator-only by default. Project: Creator/Owner manages members; members can create/update tasks per the Task rules above; progress is always computed, never stored. | §15.6, §7 |
| D8 | **Contacts**: no raw address book is ever persisted server-side. Matching uses normalized + hashed phone numbers against registered users, stateless per sync call. Pending invites resolve to the new user automatically at registration. This was already the direction §15.8 pointed to — now confirmed as the binding design, not just a recommendation. | §15.8 |
| D9 | **Database review**: full ERD re-derived after D1–D8 and written out in `docs/final-domain-model.md`, which is now the single source of truth for entities/relationships (§5–6 below are trimmed to a pointer to avoid two documents drifting apart). | §5, §6 |

Still **open** after these decisions (carried into the final review, not
blocking but worth tracking): due-date relative-label resolution (§15.7,
unchanged), delete-permission edge cases beyond what D7 states, and one new
question D3 surfaces — whether chat needs its own notification category
(the shipped `NotifSettingsScreen` had a "chats" toggle; the decision-4 list
above does not mention one). See the final review in the handoff message for
the full open-items list.

---

## 0. Product shape (context for everything below)

- **No workspace/company/tenant entity anywhere.** Identity is just a phone
  number. Projects and tasks are shared ad hoc with whoever you add — closer
  to "WhatsApp for work" than a multi-tenant SaaS. This has a real
  architectural consequence: there is no natural boundary for "which org's
  data can this query touch," so authorization must be resource-membership
  based (see §7), not tenant-based.
- **Auth is phone + OTP only.** No email, no password, anywhere in the spec
  or the code.
- **Two clients in one language system**: every UI string is bilingual
  (ar/en) in `i18n.ts`, but that's a **frontend-only** concern — it's static
  UI copy, not user content. Task titles, descriptions, chat messages, etc.
  are typed by users in one language and stored as-is. (The mock data in
  `App.tsx` has `title`/`titleEn` pairs on every task — that's an artifact of
  faking bilingual demo content, not a real data-model requirement. Flagged
  again in §15.)
- **AI is a paid layer ("Task AI") bolted onto a free core app.** Almost none
  of the AI feature set has a designed screen — see §14.

---

## 1. Screens inventory

| # | Screen (code state name) | Spec section | Notes |
|---|---|---|---|
| 1 | Language Select (`langSelect`) | — | Not in spec; app-only onboarding step |
| 2 | Welcome (`welcome`) | §07 | Register / Sign in / Terms / Privacy links |
| 3 | Phone entry (`phone`) | §08 | Shared for register + login (`mode` prop) |
| 4 | OTP Verification (`otp`) | §09 | 6-digit, resend |
| 5 | Profile Setup (`profileSetup`) | §10 | Name + optional photo — register only |
| 6 | Contacts Permission (`contacts`) | §11 | Skippable |
| 7 | Notifications Permission (`notifPerm`) | §12 | Skippable |
| 8 | Home (`home`) | §13–16 | "عليك الآن" / late / upcoming / team activity |
| 9 | Create Task (`createTask`) | §17–18 | Full form, opened via Create Sheet |
| 10 | Create Project (`createProject`) | §19 | Includes success screen ("add first task") |
| 11 | Projects list (`projects`) | — (tab) | Grid of Project Cards |
| 12 | Project Detail (`projectDetail`) | §20–21 | Progress bar, stats, task list |
| 13 | Task Detail (`taskDetail`) | §22–31 | The core screen: info, AI banner, timeline, composer |
| 14 | Task Report (`taskReport`) | §32–35 | Progress, done/remaining, AI summary, AI risk |
| 15 | Member Picker (sheet) | §37–40 | Shared by Create Task (assignee/participants) & Create Project |
| 16 | Notifications (`notifications`) | §43–44 | Unread/read sections |
| 17 | Profile (`profile`) | §45 | Settings entry points, AI promo, logout |
| 18 | Notification Settings (`notifSettings`) | — (spec says "لا نضع إعدادات كثيرة") | Granular toggles — model confirmed by D3, see §9 |
| 19 | Contacts Settings (`contactsSettings`) | — | On-app vs invite-needed lists |
| 20 | Share App (`shareApp`) | — | Referral link + social share targets |
| 21 | Language Change (`langChange`) | — | From Profile |
| 22 | Terms of Use (`terms`) | — | Static legal content, 11 sections |
| 23 | Privacy Policy (`privacy`) | — | Static legal content, 12 sections |
| 24 | Create Sheet (bottom sheet) | §16 | Task vs Project chooser |
| 25 | **Conversations list (`conversations`)** | **not in spec, confirmed for V1 by D1 (scope reduced)** | 1:1 chat inbox — see §2.10 |
| 26 | **Chat (`chat`)** | **not in spec, confirmed for V1 by D1 (scope reduced)** | Text/image/file/voice, mentions, share task/project, convert-to-task; polls dropped |
| 27 | New Chat sheet | — | Pick contact or raw phone number |
| 28 | Change Phone Number sheet | — | Re-verify via OTP |
| 29 | Country Code Picker sheet | — | Used by phone + change-phone + new-chat |

**Screens named in the spec's "MVP top 10" (§69) that are absent from the
code**: a standalone **Search results screen** and an **AI Search screen**
(§41–42). The Home search bar exists visually but has no `onClick`/handler in
the code — it's decorative. Search itself is now confirmed for V1 (D4,
basic only); the screen still needs a UI design pass, but that doesn't block
the backend contract in §11/§16.

---

## 2–4. Per-screen data, actions, and required APIs

Grouped by domain rather than per-screen (many screens share the same
underlying resource). API paths are proposed REST shapes — see §16 for the
full endpoint table.

### 2.1 Onboarding / Auth
| Screen | Data needed | User actions | API |
|---|---|---|---|
| Phone | country code list, phone input | Submit phone | `POST /auth/otp/request` |
| OTP | 6-digit boxes, resend timer | Enter code, resend | `POST /auth/otp/verify`, `POST /auth/otp/request` (resend) |
| Profile Setup | — | Enter name, upload photo | `PATCH /users/me`, `POST /files` (avatar) |
| Contacts Permission | — | Allow / Not now | `POST /users/me/contacts/sync` (only if allowed) |
| Notif Permission | — | Allow / Not now | `POST /devices` (register push token, only if allowed) |

Login (`mode: 'login'`) and Register (`mode: 'register'`) share the phone/OTP
screens; the backend must return `isNewUser` from OTP verification so the
client knows whether to route into Profile Setup or straight to Home.

### 2.2 Home
| Data needed | Source |
|---|---|
| Current user name + avatar | `GET /users/me` |
| "عليك الآن" (action-needed) task list | `GET /tasks?section=now` |
| "متأخرة" (overdue) task list | `GET /tasks?section=late` |
| "قادمة" (upcoming) task list | `GET /tasks?section=upcoming` |
| "آخر تحديثات الفريق" (team activity feed) | `GET /activity?scope=me` |
| Unread notification badge count | `GET /users/me` (denormalized) or `GET /notifications?filter=unread&count=true` |

**Business rules the backend must define (not fully specified by the
design)**:
- *Action needed* = tasks where I'm assignee (or maybe participant?) AND
  status ≠ done. The spec text ("المهام التي تحتاج إجراءً من المستخدم") is
  vague on assignee-only vs assignee+participant. **Needs a product
  decision** — recommend assignee-only for V1, matching §38 ("شخص واحد فقط"
  for assignee).
- *Overdue* = `due_date < now() AND status != 'done'`.
- *Upcoming* = `due_date > now() AND status != 'done'`, likely capped/sorted
  by soonest.
- *Team activity* = latest N `TaskUpdate` rows across tasks/projects the user
  can see, excluding the user's own updates (the mock shows only teammates'
  activity, never "you").

User actions: tap a task card → Task Detail; tap a project card → Project
Detail; tap "+" → Create Sheet → Create Task / Create Project.

### 2.3 Create Task / Create Project
| Field | Required? | Notes |
|---|---|---|
| Title | required | |
| Assignee | optional in UI (button always enabled once title filled) | single person, via Member Picker (`singleSelect`) |
| Participants ("شارك مع") | optional | multiple, can include external (unregistered) invites |
| Due date | optional | quick-chip choice: Today / Tomorrow / This week / Next week — **not a date picker**. Backend should resolve these labels to an actual `due_date` timestamp at creation time server-side or client-side (needs a decision — recommend server-side so "Tomorrow" always resolves to the same timezone rule) |
| Details (description) | optional | free text |
| Project | optional | dropdown of existing projects |

Project creation additionally has: description, color (8-swatch palette —
this is purely a client-rendering hint stored as a hex string), members.
After creation, a success screen offers "Add first task" (routes into Create
Task pre-scoped to the project) or "Later".

API: `POST /tasks`, `POST /projects`.

### 2.4 Member Picker (shared component)
Used for both task assignee/participants and project members. Two paths:
1. Search existing people ("الأشخاص الذين تعمل معهم" — people you already
   share a task/project with, plus phone contacts) → `GET /people/search?q=`
2. No match found → "دعوة برقم الجوال" invite-by-phone flow → creates a
   **pending external participant** tied to a phone number, not a user id.
   Per spec §40: *"بعد التسجيل: المهمة تظهر له تلقائيًا"* — when that phone
   number registers, they must be **automatically** attached to every
   task/project they were pending-invited into. This requires the backend to
   resolve pending invites by phone number at registration time
   (`POST /auth/otp/verify` → on `isNewUser`, run a reconciliation job).

API: `POST /invites`, and invite resolution logic on registration.

### 2.5 Task Detail
| Data | Source |
|---|---|
| Title, status, assignee, due date, description | `GET /tasks/:id` |
| Participants (chips) | included in task payload |
| AI suggestion banner (§35) | `GET /tasks/:id` (embedded) or separate `GET /ai/tasks/:id/suggestions` — gated by Task AI entitlement |
| Timeline (updates) | `GET /tasks/:id/updates` (paginated, chronological, grouped by day) |
| Composer state | n/a (client) |

Actions:
- **Mark Done** → confirm dialog → `POST /tasks/:id/status {status:'done'}`.
  Must append a system timeline entry ("X أكمل المهمة") — the code renders
  system entries (`isSystem: true`) inline in the timeline, so status changes
  are really just a special kind of `TaskUpdate`.
- **Reopen** → `POST /tasks/:id/status {status:'in_progress'}` (or a
  dedicated `/reopen`), keeping all prior history (§31 — never delete).
- **Send update** → text, and separately attach file / photo / voice note.
  → `POST /tasks/:id/updates`. An update can carry text AND a file in the
  same message (see mock: "تم رفع النسخة الجديدة." + attached PDF).
- **Report button** → navigates to Task Report (§2.6).
- **Checklist** (D2): add/complete/reopen/reorder checklist items on the
  task. Not shown as a distinct section in the original mock, but is now the
  backing data for the Task Report's completed/remaining lists and the
  progress percentage — needs a UI home on this screen (product/design task,
  not a backend blocker).
  → `POST /tasks/:id/checklist-items`,
  `POST /tasks/:id/checklist-items/:itemId/complete`,
  `POST /tasks/:id/checklist-items/:itemId/reopen`.
- **AI suggestion "Add action" / "Dismiss"** (resolved by D5) → accepting
  creates a `TaskChecklistItem` from the suggested action text; dismissing
  just marks the `AISuggestion` dismissed.

### 2.6 Task Report
| Data | Source |
|---|---|
| Task summary (title, status, owner, due date) | `GET /tasks/:id` |
| Progress % | **Resolved (D2)**: `completed checklist items / total checklist items`. If the task has zero checklist items, the API returns `progress: null` (not a fabricated percentage) and the client shows a "no checklist yet" state instead of a bar. |
| Completed items / Remaining items | Now real data: `TaskChecklistItem` rows split by `isCompleted` |
| Last update, update count | `GET /tasks/:id/updates` aggregates |
| AI Summary (§33) | `GET /ai/tasks/:id/summary` — paid, **in V1 scope (D5)** |
| AI Risk (§34) | `GET /ai/tasks/:id/risk` — paid, **in V1 scope (D5)** |
| Last 3 activity items | merged view of `TaskUpdate` + `TaskActivity`, see `final-domain-model.md` |

### 2.7 Projects / Project Detail
| Data | Source |
|---|---|
| Project list with progress/task/member/late counts | `GET /projects` |
| Project detail: name, progress %, task count, late count, member count | `GET /projects/:id` |
| Task list within project | `GET /projects/:id/tasks` |

Progress % here **is** well-defined: `done_tasks / total_tasks * 100` (§21
confirms: "12 من 16 مهمة مكتملة").

### 2.8 Notifications
| Data | Source |
|---|---|
| Unread section, read/"earlier" section | `GET /notifications` |
| Icon + text + relative time per item | denormalized notification row |

Actions: tap a notification → deep-link to the related task/project/chat;
"تحديد الكل كمقروء" → `POST /notifications/read-all`.

**Resolved by D3.** Notification categories are: Task Assigned, Task
Updated, Mention, Due Date/Overdue, Project Updates — each independently
toggleable — plus delivery-level toggles Sound, Vibration, Preview, and
Weekly Email digest. The spec's two-tier "مهم/عادي" priority split (§44) is
kept only as the **default value** each category is seeded with (assignment/
mention/deadline default ON+push-worthy, generic updates default ON+in-app
only), not as a separate user-facing control.

**Open question surfaced by this decision, not yet resolved:** Chat is now
in V1 (D1), but D3's category list does not include a "New messages" /
"Chats" toggle, even though the original coded `NotifSettingsScreen` had
one. Recommend adding a `NewMessage` category for consistency, pending
confirmation — see the final review for this open item.

### 2.9 Profile / Settings
| Screen | Data | Actions |
|---|---|---|
| Profile | name, phone, avatar, task/project/completed counts | Change language, change phone, notif settings, contacts, terms, privacy, Task AI promo, share app, logout |
| Change Phone | current phone | new number → OTP → confirm → `PATCH /users/me` (phone) |
| Contacts Settings | synced contact list w/ on-app flag | "Message" (opens chat) / "Invite" |
| Share App | static referral link | copy / share via platform (client-only; optionally track referrals server-side) |

Profile stat counts require aggregate queries: total tasks
(assigned+participant), total projects (member of), completed task count.

### 2.10 Chat / Conversations — **confirmed for V1 (D1), scope reduced from the prototype**
The coded prototype (§1, screens 25–27) over-built this relative to what's
approved. V1 scope is:

| In scope (D1) | Explicitly out (D1 + D6) |
|---|---|
| 1:1 conversations only | Group chat |
| Text messages | Voice/video calls |
| Images | Meetings, recording, transcription |
| Files | Stories |
| Voice messages | Channels |
| Emoji (plain Unicode text, no separate message type) | "Status" (WhatsApp-style ephemeral posts) |
| Mentions | |
| Share Task / Share Project (a message can carry a reference to a task or project card) | |
| Convert message → Task | |

The prototype's **poll feature is dropped** — it wasn't in the approved
scope list and adds `Poll`/`PollOption`/`PollVote` entities for no requested
capability. If polls are wanted later, they're a clean V2 add.

The prototype's keyword-based task-link *suggestion* banner
(`TASK_KEYWORDS` in `App.tsx`) is a hardcoded demo, not real NLP — it is
**not** part of D1's scope ("link message to a task" was a suggestion
feature, not requested). What **is** requested and in scope is a direct,
user-initiated **"Convert message to Task"** action and explicit
**Share Task / Share Project** actions — both deliberate user choices, not
an automatic AI suggestion.

| Screen | Data | Actions | API |
|---|---|---|---|
| Conversations list | 1:1 conversations, unread counts, last message preview | Open conversation, start new chat | `GET /conversations` |
| New Chat sheet | contacts list, or raw phone number entry | Pick contact / enter phone → start chat | `GET /people/search`, `POST /conversations` |
| Chat | message history | Send text/image/file/voice, insert mention, share a task, share a project, convert message → task | `GET /conversations/:id/messages`, `POST /conversations/:id/messages`, `POST /conversations/:id/messages/:id/convert-to-task` |

Real-time delivery (new messages, unread counts, live notification badges)
requires a **websocket or push-based channel** — see `backend-architecture.md`.

### 2.11 Legal
Terms and Privacy content is fully static (11 + 12 sections respectively,
bilingual). Recommend serving as versioned static content
(`GET /legal/terms`, `GET /legal/privacy`) so that acceptance timestamps can
reference a specific version, plus:
`POST /users/me/consents {termsVersion, privacyVersion}` recorded at
registration (the Welcome screen's footer text implies consent is given by
continuing, but there's no explicit checkbox — worth confirming this
satisfies whatever jurisdiction's consent requirements apply, since Privacy
Policy body text itself promises versioned change notices 14 days in
advance, §11 of privacy content).

---

## 5–6. Database entities & relationships

**Superseded by `docs/final-domain-model.md`.** That document is now the
single source of truth for every entity, field, enum, and relationship
(re-derived after decisions D1–D9). Keeping a second, duplicate entity list
here would drift out of sync as the domain model evolves — this file stays
focused on screen → requirement traceability instead.

The one thing worth restating here because it's a hard product constraint,
not a schema detail: **a Task's `projectId` is optional.** The spec's
Principle 3 ("المشروع اختياري") requires tasks to be fully functional with
no project at all — this must never become an implicit foreign key
requirement anywhere in the implementation.

---

## 7. Authorization requirements — resolved (D7)

Full matrix and enum definitions are in `docs/final-domain-model.md`
(§ Permissions). Summary:

**Task**
- **Creator** — edits task settings (title, description, due date, project
  assignment), deletes the task, adds/removes participants, changes Owner.
- **Owner** (the renamed "assignee"/"المسؤول", exactly one person) — updates
  and executes the task: changes status (start/complete/reopen), manages the
  checklist, adds updates/files.
- **Participants** — add updates and files only. Cannot change status,
  cannot touch the checklist, cannot change Owner, cannot delete.
- Changing the Owner and deleting the task are **Creator-only** by default —
  the spec's "أو صاحب الصلاحية" (or whoever has permission) phrasing doesn't
  name a second role, so V1 treats that as Creator-only until a real
  permission-grant mechanism is designed (there isn't one in V1 — no roles
  engine, per D7).
- **Visibility**: Creator, Owner, Participants (once resolved if external),
  and — if the task belongs to a project — all members of that project (a
  project member can see all of the project's tasks by default, matching
  §20's Project Detail screen).

**Project**
- **Creator/Owner** manages membership (add/remove members).
- **Members** can create tasks inside the project and update tasks per the
  Task rules above (creating a task inside a project makes the creating
  member that task's Creator).
- **Progress is always computed** (`done tasks / total tasks`), never a
  stored/editable field.
- **Visibility**: members only.

**Chat**: a conversation is strictly between its two participants; no one
else can ever read it.

**No global admin/staff role exists anywhere in the frontend.** Out of scope.

**Still open** (not blocking, but not covered by D7 either): whether the
Owner (not just the Creator) can hand off the Owner role themselves, and
whether the Owner can add/remove participants in addition to the Creator.
Both default to "no" under the matrix above; flag if that's wrong.

---

## 8. Authentication requirements

- **Phone + OTP only.** No password field exists anywhere in the spec or
  code.
- Flow: `POST /auth/otp/request {countryCode, phone}` → SMS sent →
  `POST /auth/otp/verify {requestId, code}` → returns
  `{accessToken, refreshToken, isNewUser}`.
- `isNewUser=true` routes the client into Profile Setup → Contacts
  permission → Notifications permission → Home. `isNewUser=false` (login
  mode) routes straight to Home.
- Access token used as a bearer token on all authenticated calls; refresh via
  `POST /auth/refresh`.
- Phone number change (`ChangePhoneSheet`) re-runs the same OTP flow scoped
  to the already-authenticated user, then updates `User.phone` — this must
  also re-run the **pending-invite reconciliation** (a task/project may have
  been externally-invited under the *old* number).
- Rate-limit OTP requests per phone number and per IP (not specified in
  design, standard requirement given SMS cost/abuse risk).
- Session/logout: client just discards tokens (`onLogout` resets to
  `langSelect`) — recommend a server-side refresh-token revocation endpoint
  regardless (`POST /auth/logout`) even though the prototype doesn't call one.

---

## 9. Notifications — resolved (D3)

**Categories** (final, per D3): Task Assigned, Task Updated, Mention, Due
Date/Overdue, Project Updates. Each independently toggleable, modeled as an
extensible list rather than fixed boolean columns (see
`final-domain-model.md`) so a future category doesn't need a migration.

**Delivery-level settings** (separate from category toggles): Sound,
Vibration, Preview, Weekly Email digest.

**Defaults**: seeded using the spec's important/normal split (§44) as
guidance only — assignment/mention/due-date default ON with push, generic
task/project updates default ON but in-app-only — not exposed to the user as
a separate priority control.

**Read state**: individual mark-as-read on tap, bulk "mark all read".

**Push delivery** requires device token registration (`POST /devices`) tied
to the Notifications Permission screen's "Allow" action.

**Open item**: no "new chat message" category was named in D3 despite Chat
now being in V1 (D1) — see the decisions log's open-items note and the final
review handoff.

---

## 10. File handling

- Files are **never** shown in a standalone Files screen by design principle
  (§28) — they live inline inside the `TaskUpdate` that introduced them
  (name + size shown as a small card, e.g. "العقد النهائي.pdf — 2.4 MB").
- An update can carry **either** text, **or** a file, **or both** in the same
  message.
- Upload flow: client uploads to `POST /files` (multipart) first, gets back
  `{id, url, name, size, mimeType}`, then references that file id when
  posting the update (`POST /tasks/:id/updates {text?, fileId}`).
- Voice notes: the composer's mic button (🎤) implies voice-note recording
  and upload is intended, but there is **no working implementation** in the
  prototype (button has no handler) — treat as same file-upload path with
  `type: 'voice'`.
- No file size/type limits are specified anywhere — needs a product decision
  before backend validation can be written.
- Even though there's no Files screen in V1, the backend should still make
  attachments independently queryable (by task, by project, by uploader) —
  spec §42's AI Search example ("أين آخر نسخة من عقد المدرسة؟") explicitly
  searches across files, so the data must be indexable even though no UI
  browses it directly today.

---

## 11. Search — resolved (D4)

- **In V1**, as unified basic search across five domains: Tasks, Projects,
  People, Files, **and Conversations** (the last one added by D4 — search
  matches a conversation by counterpart name or message text and returns the
  conversation, not individual messages, as the result unit).
- Engine: Postgres `ILIKE` and/or full-text search (`tsvector`/`GIN`
  indexes on `Task.Title`, `Task.Description`, `Project.Name`,
  `Project.Description`, `User.Name`, `Attachment.FileName`, `Message.Text`)
  — sized appropriately for current scale, not a dedicated search cluster.
- **AI Search is explicitly excluded from V1** (D4/D5). The implementation
  must sit behind an `ISearchProvider`-style abstraction (see
  `backend-architecture.md`) so a future semantic/AI provider can be swapped
  in later **without changing the public `GET /search` contract**.
- Search results must respect the same visibility rules as §7 — never return
  a task/project/conversation the requesting user isn't a member/participant
  of. This applies uniformly regardless of which provider answers the query.
- Still needs product design: the still-open standalone Search *screen*
  layout referenced in the original review (§1) — the endpoint contract
  above doesn't require a finished UI to exist first, but one should be
  designed soon since the API is now committed.

---

## 12. Reports — resolved (D2)

- **Task Report** (§32): per-task progress %, owner, last update time, due
  date, completed vs remaining checklist, last 3 activity items, optional AI
  Summary + AI Risk sections. **Now unblocked** — progress and the
  completed/remaining lists are backed by real `TaskChecklistItem` rows
  (D2). See §2.6.
- **Project-level reporting**: no dedicated "Project Report" screen exists;
  spec §67's manager scenario stays task-by-task (Home → Projects → Project
  → Progress → Task → Report). No separate endpoint needed beyond §2.7.
- **Daily Manager Report / AI Project Summary** (§57): confirmed **Future/V2**
  by D5 — no screen, no backend logic in V1. See §13.

---

## 13. AI features (all part of the paid "Task AI" tier) — scope resolved (D5)

| Feature | Spec ref | Screen exists? | V1 status |
|---|---|---|---|
| Smart Summary (per task) | §33 | Yes (Task Report + Task Detail banner) | **In V1** — `GET /ai/tasks/:id/summary`, real business logic |
| Risk Detection | §34 | Yes | **In V1** — `GET /ai/tasks/:id/risk`, real business logic |
| Suggestions ("اقتراح ذكي") | §35 | Yes | **In V1** — `GET /ai/tasks/:id/suggestions`; "Add action" now creates a `TaskChecklistItem` (resolved by D2) |
| AI Task Creation (NL → task fields) | §36 | No screen, described only | **Future/V2** — abstraction only, no logic |
| AI Search | §42 | No | **Future/V2** — see §11/D4 |
| Voice to Task | §57 (name only) | No | **Future/V2** |
| Meeting Summary | §57 (name only) | No | **Future/V2** |
| Daily Manager Report | §57 (name only) | No | **Future/V2** |
| AI Project Summary | §57 (name only) | No | **Future/V2** |

**Rule going forward (D5): only build backend logic for AI features that
have an actual designed screen today.** That's Smart Summary, Risk
Detection, and Suggestions — nothing else gets real implementation this
round, regardless of how it's phrased in the spec's paywall bullet list.

**Paywall model** (§57–59) still applies to the three in-scope features:
base app free, Task AI a subscription, with a limited free trial per feature
before requiring subscription (§58). The spec never states the trial limit
— **still an open product input** (count vs. one-time vs. time-boxed);
`AIFeatureTrialUsage` in `final-domain-model.md` is deliberately generic
pending that number.

None of the AI screens in the *coded* prototype are actually gated — the
banners render unconditionally with static mock text. The real backend,
unlike the prototype, must enforce entitlement checks
(`Subscription.status`, `AIFeatureTrialUsage`) in front of all three in-scope
AI routes.

---

## 14. Future / V2 features — confirmed out of scope for V1 (D5, D6)

Not to be estimated, designed against, or given real business logic until
product delivers a screen/flow for each:
1. AI Task Creation from natural language (§36)
2. AI Search (§42)
3. Voice to Task
4. Meeting Summary
5. Daily Manager Report
6. AI Project Summary
7. **Calls & Meetings in full** (D6): no WebRTC, no audio/video calls, no
   recording, no transcription — nothing built, not even a stub.

The architecture may reserve clean extension points for these (see
`backend-architecture.md`), but zero business logic is implemented now.

---

## 15. Ambiguities, gaps, and spec-vs-code conflicts — status after decisions

Each item from the original review, with its resolution:

1. **Chat scope.** ✅ **Resolved — D1.** Chat is in V1, scoped to simple 1:1
   (see §2.10). Polls dropped; keyword-based task-link suggestion dropped in
   favor of explicit user-initiated Share/Convert actions.

2. **No subtask/checklist entity, but Task Report needs one.** ✅ **Resolved
   — D2.** `TaskChecklistItem` added directly under Task; progress is
   `completed/total`, never fabricated.

3. **Notification settings model conflict.** ✅ **Resolved — D3.** Shipped
   category-toggle model wins over the spec's two-tier text; see §9.
   ⚠️ **New open question from this resolution**: no "chat/new message"
   category was named in D3 despite Chat now being in V1 — see the final
   review handoff for this.

4. **AI "Add action" target undefined.** ✅ **Resolved — D2 + D5.** Creates a
   `TaskChecklistItem`.

5. **Search entirely unbuilt.** ✅ **Resolved — D4.** In V1, basic
   Postgres-backed search across 5 domains; AI search deferred behind an
   abstraction. See §11.

6. **Assignee vs. participant mutation permissions unconfirmed.** ✅
   **Resolved — D7.** Full matrix in §7 and `final-domain-model.md`.
   ⚠️ **Two sub-questions D7 doesn't fully close**: can the Owner (not just
   Creator) hand off the Owner role, and can the Owner add/remove
   participants. Defaulted to "no" — flag if wrong.

7. **Due-date resolution (relative chips → real timestamp).** ⚠️ **Still
   open.** Not addressed by D1–D9. Needs a decision on timezone handling and
   what "this week"/"next week" resolve to (Saudi week boundaries vs.
   Western). Does not block starting backend work (default to a reasonable
   server-side rule, e.g. Riyadh timezone, week = Sun–Sat), but should be
   confirmed before shipping due-date logic.

8. **Contacts privacy vs. "people I work with" search.** ✅ **Resolved —
   D8.** Stateless hash-match, nothing persisted. See §16
   `/users/me/contacts/sync` and `backend-architecture.md`.

9. **No delete functionality anywhere in the UI.** ⚠️ **Still open** — D7
   does specify *who* can delete a task (Creator) but the broader question of
   whether delete ships at all in V1 (vs. archive-only, matching the "never
   delete history" principle in §31) wasn't explicitly addressed. Recommend
   treating task/project delete as **soft-delete/archive**, not hard delete,
   consistent with §31's reopen-keeps-history rule — confirm before building
   the endpoint.

10. **AI entitlement unenforced in the prototype.** ✅ **Resolved — D5.**
    Real backend enforces `Subscription`/`AIFeatureTrialUsage` gating for the
    three in-scope AI features (Summary, Risk, Suggestions).

11. **Bilingual UI vs. user content.** ✅ **Confirmed, not contested** — §0's
    reading stands: user content is single-language as typed, bilingual
    strings are frontend-only UI copy. No entity carries `*_en` fields.

12. **FAB placement.** Not addressed (frontend UX detail, not a backend
    blocker). Still noted for whoever owns frontend polish.

---

## 16. API endpoint summary

REST shapes proposed to satisfy everything above (final routing/naming is an
implementation detail — this is the contract of *what must exist*, not a
finished spec). Updated below to reflect D1–D9; the authoritative module
breakdown (with request/response shapes) lives in `backend-architecture.md`.

**Auth**
```
POST   /auth/otp/request        {countryCode, phone}
POST   /auth/otp/verify         {requestId, code} → {accessToken, refreshToken, isNewUser}
POST   /auth/refresh            {refreshToken}
POST   /auth/logout
```

**Users**
```
GET    /users/me
PATCH  /users/me                {name?, avatarUrl?, language?}
POST   /users/me/phone/change/request   {countryCode, phone}
POST   /users/me/phone/change/verify    {requestId, code}
POST   /users/me/contacts/sync  {hashedContacts[]}   -- ephemeral, not persisted (see §15.8)
POST   /users/me/consents       {termsVersion, privacyVersion}
POST   /devices                 {platform, pushToken}
```

**People / Invites**
```
GET    /people/search           ?q=
GET    /contacts                -- on-app vs invite-needed, from synced contacts
POST   /invites                 {phone, name?, context:{type, id}}
```

**Tasks**
```
GET    /tasks                   ?section=now|late|upcoming&projectId=&status=
GET    /tasks/:id
POST   /tasks                   {title, ownerId?, participantIds?[], externalInvites?[], dueDate?, description?, projectId?}
PATCH  /tasks/:id                {title?, dueDate?, description?, ownerId?}
POST   /tasks/:id/status         {status}
POST   /tasks/:id/reopen
POST   /tasks/:id/participants   {userIds?[], externalInvites?[]}
DELETE /tasks/:id/participants/:userId
GET    /tasks/:id/updates        ?before=&limit=
POST   /tasks/:id/updates        {text?, fileId?, mentions?[]}
GET    /tasks/:id/report

-- Checklist (D2)
GET    /tasks/:id/checklist-items
POST   /tasks/:id/checklist-items          {title, sortOrder?}
PATCH  /tasks/:id/checklist-items/:itemId  {title?, sortOrder?}
POST   /tasks/:id/checklist-items/:itemId/complete
POST   /tasks/:id/checklist-items/:itemId/reopen
DELETE /tasks/:id/checklist-items/:itemId
```

**Projects**
```
GET    /projects
GET    /projects/:id
POST   /projects                 {name, description?, color, memberIds?[], externalInvites?[]}
PATCH  /projects/:id             {name?, description?, color?}
GET    /projects/:id/tasks
POST   /projects/:id/members     {userIds?[], externalInvites?[]}
DELETE /projects/:id/members/:userId
```

**Files**
```
POST   /files                    multipart upload
GET    /files/:id
```

**Notifications** (categories per D3)
```
GET    /notifications             ?filter=unread|all
POST   /notifications/:id/read
POST   /notifications/read-all
GET    /notifications/preferences
PATCH  /notifications/preferences {taskAssigned?, taskUpdated?, mention?, dueDateOverdue?, projectUpdates?}
GET    /notifications/delivery-settings
PATCH  /notifications/delivery-settings {sound?, vibration?, preview?, weeklyEmail?}
```

**Search** (D4 — free/basic in V1, AI deferred)
```
GET    /search                    ?q=&types=tasks,projects,people,files,conversations
```
*(No `/ai/search` route in V1 — see `backend-architecture.md` for the
`ISearchProvider` extension point reserved for it.)*

**Chat** (confirmed V1, scope per D1 — see §2.10)
```
GET    /conversations
POST   /conversations                          {userId | phone}
GET    /conversations/:id/messages             ?before=&limit=
POST   /conversations/:id/messages             {text?, fileId?, type, mentions?[]}
POST   /conversations/:id/messages/:id/share-task     {taskId}
POST   /conversations/:id/messages/:id/share-project  {projectId}
POST   /conversations/:id/messages/:id/convert-to-task {title?}   -- title defaults from message text
```

**AI / Task AI** (entitlement-gated; scope per D5 — Summary/Risk/Suggestions only)
```
GET    /ai/subscription
POST   /ai/subscription/trial/start   {feature: 'summary'|'risk'|'suggestions'}
POST   /ai/subscription/checkout
GET    /ai/tasks/:id/summary
GET    /ai/tasks/:id/risk
GET    /ai/tasks/:id/suggestions
POST   /ai/tasks/:id/suggestions/:sid/accept    -- creates a TaskChecklistItem (D2)
POST   /ai/tasks/:id/suggestions/:sid/dismiss
```
*(No routes for AI Task Creation, Voice to Task, Meeting Summary, Daily
Manager Report, AI Project Summary, or AI Search in V1 — see §14.)*

**Legal**
```
GET    /legal/terms
GET    /legal/privacy
```

---

## 17. Backend architecture

**Superseded by `docs/backend-architecture.md`.** That document now holds
the full technical architecture (stack, layering, real-time approach,
search/AI abstractions, background jobs) built specifically to satisfy
D1–D9. This section is intentionally left as a pointer rather than a second,
divergent copy.

---

*End of contract. Decisions D1–D9 are applied; remaining open items are
§15.3's chat-notification-category question, §15.7 (due-date resolution),
and §15.9 (delete vs. archive semantics) — none block starting backend work,
all should be confirmed before the affected endpoints ship. No backend
implementation has been started.*
