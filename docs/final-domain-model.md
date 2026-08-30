# TaskUp — Final Domain Model

Authoritative entity schema, re-derived after decisions D1–D9 (see
`docs/frontend-backend-contract.md`'s decisions log). This is the input to
EF Core migrations — nothing here should be treated as provisional. Where a
field's exact business rule is still open, it's called out explicitly
rather than silently assumed.

Conventions: `Guid` primary keys, `DateTimeOffset` timestamps stored in UTC,
PascalCase field names (C#/EF Core convention). `?` marks nullable.

---

## 0. Module map

```
Identity     → User, Device, Session, OtpRequest, Consent
Projects     → Project, ProjectMember
Tasks        → Task, TaskParticipant, TaskChecklistItem, TaskUpdate, TaskActivity
Shared       → Attachment, Mention        (polymorphic: used by Tasks AND Chat)
Chat         → Conversation, Message
Invites      → Invite                     (generic, replaces per-module invite tables)
Notifications→ Notification, NotificationPreference, NotificationDeliverySettings
Task AI      → Subscription, AIFeatureTrialUsage, AITaskSummary, AIRiskFlag, AISuggestion
```

No `TenantId` anywhere — there is no workspace/company boundary in this
product (contract §0). No `Role`/`Permission` entities — V1 uses the fixed
rules in §8 below, not a roles engine (D7).

---

## 1. Identity module

### User
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| Phone | string | **Unique**, normalized E.164 (e.g. `+9665XXXXXXXX`) |
| Name | string | |
| AvatarUrl | string? | Points to an `Attachment`-uploaded image or null |
| Language | enum(`Ar`, `En`) | Last-selected UI language; frontend-only concern, stored so it persists across devices |
| ContactsPermissionGranted | bool | |
| NotificationsPermissionGranted | bool | |
| CreatedAt / UpdatedAt | DateTimeOffset | |

No `Email`, no `PasswordHash` — auth is phone+OTP only (contract §8). No
`title`/localized-content duplicate fields — bilingual strings are frontend
UI copy only, never user data (contract §0/§15.11).

### Device
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| UserId | Guid (FK → User) | |
| Platform | enum(`iOS`, `Android`) | |
| PushToken | string | |
| CreatedAt | DateTimeOffset | |

### Session
Refresh-token tracking — one row per issued refresh token, enabling
server-side revocation (contract §8).
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| UserId | Guid (FK → User) | |
| RefreshTokenHash | string | Never store the raw token |
| DeviceId | Guid? (FK → Device) | |
| IssuedAt / ExpiresAt | DateTimeOffset | |
| RevokedAt | DateTimeOffset? | Set on logout / refresh rotation |
| IpAddress / UserAgent | string? | Abuse/audit trail |

### OtpRequest
Ephemeral — short retention, not part of the long-lived domain model
conceptually, but still a real table.
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| Phone | string | |
| CodeHash | string | |
| Purpose | enum(`Register`, `Login`, `ChangePhone`) | |
| Attempts | int | For rate-limiting/lockout |
| ExpiresAt | DateTimeOffset | |
| ConsumedAt | DateTimeOffset? | |
| CreatedAt | DateTimeOffset | |

### Consent
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| UserId | Guid (FK → User) | |
| TermsVersion | string | |
| PrivacyVersion | string | |
| AcceptedAt | DateTimeOffset | |

**No persisted contact book anywhere in Identity or elsewhere** — see §9,
D8. Contact matching is a stateless operation, not a stored entity.

---

## 2. Projects module

### Project
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| Name | string | |
| Description | string? | |
| Color | string | Hex swatch, purely a client-rendering hint |
| CreatedById | Guid (FK → User) | |
| Status | enum(`Active`, `Archived`) | |
| CreatedAt / UpdatedAt | DateTimeOffset | |
| DeletedAt | DateTimeOffset? | Soft-delete — see §11 open item on delete semantics |
| *Progress* | `[NotMapped]` computed | `done tasks / total tasks`, never stored (contract §7/D7) |

### ProjectMember
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| ProjectId | Guid (FK → Project) | |
| UserId | Guid (FK → User) | |
| Role | enum(`Owner`, `Member`) | Owner = creator by default; only role distinction that exists |
| InvitedById | Guid? (FK → User) | |
| JoinedAt | DateTimeOffset | |

Unique constraint on `(ProjectId, UserId)`.

---

## 3. Tasks module

### Task
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| Title | string | Required |
| Description | string? | "التفاصيل", optional |
| Status | enum(`NotStarted`, `InProgress`, `Done`) | |
| ProjectId | Guid? (FK → Project) | **Nullable — a task is fully functional with no project** (spec Principle 3, hard requirement) |
| CreatedById | Guid (FK → User) | The **Creator** |
| OwnerId | Guid? (FK → User) | The **Owner** (spec's "المسؤول"/assignee) — nullable until assigned, exactly one person, never a list |
| DueDate | DateTimeOffset? | Resolved absolute timestamp — see §11 open item on relative-label resolution rule |
| CreatedAt / UpdatedAt | DateTimeOffset | |
| CompletedAt | DateTimeOffset? | |
| CompletedById | Guid? (FK → User) | |
| DeletedAt | DateTimeOffset? | Soft-delete — see §11 open item |
| *Progress* | `[NotMapped]` computed | `completed checklist items / total`; **`null` if the task has no checklist items — never a fabricated number** (D2) |
| *IsOverdue* | `[NotMapped]` computed | `DueDate < now() AND Status != Done` |

Reopen is not a separate column — it's a `TaskActivity` entry
(`Type = Reopened`); `Status` simply moves back to `InProgress` and prior
history is never deleted (spec §31).

### TaskParticipant
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| TaskId | Guid (FK → Task) | |
| UserId | Guid (FK → User) | |
| AddedById | Guid (FK → User) | |
| AddedAt | DateTimeOffset | |

Unique constraint on `(TaskId, UserId)`.

### TaskChecklistItem — **exact schema per decision D2**
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| TaskId | Guid (FK → Task) | |
| Title | string | |
| IsCompleted | bool | |
| CompletedById | Guid? (FK → User) | |
| CompletedAt | DateTimeOffset? | |
| SortOrder | int | |
| CreatedAt / UpdatedAt | DateTimeOffset | |

**Deliberately does not have**: members, participants, chat, independent
permissions, or an independent due date (D2, explicit exclusion list). It
is a plain child of Task — nothing more.

### TaskUpdate — "تحديث", human content only
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| TaskId | Guid (FK → Task) | |
| AuthorId | Guid (FK → User) | Always a real user — **no system/null author here** (system events live in `TaskActivity` instead, see below) |
| Type | enum(`Text`, `Image`, `File`, `Voice`) | |
| Text | string? | Can be null if the update is attachment-only |
| CreatedAt | DateTimeOffset | |

Attachments and mentions on a `TaskUpdate` go through the shared
`Attachment`/`Mention` tables (§5), keyed by `OwnerType = TaskUpdate`.

### TaskActivity — system audit trail, separate from human updates
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| TaskId | Guid (FK → Task) | |
| ActorId | Guid? (FK → User) | Null = system-triggered (e.g. automated overdue transition) |
| Type | enum(`Created`, `StatusChanged`, `OwnerChanged`, `ParticipantAdded`, `ParticipantRemoved`, `ChecklistItemAdded`, `ChecklistItemCompleted`, `ChecklistItemReopened`, `Completed`, `Reopened`, `Deleted`) | |
| Metadata | jsonb? | e.g. `{ from: "in_progress", to: "done" }` for `StatusChanged` |
| CreatedAt | DateTimeOffset | |

**Why this is split from `TaskUpdate`** (and not a single `isSystem` flag
like the prototype's mock data): the user's requested entity tree lists
`Updates` and `Activity/Audit` as two separate children of `Task`. Splitting
them also means `TaskUpdate` stays a clean, human-authored-only table (no
`AuthorId` nullability to work around) and `TaskActivity` can grow richer
structured metadata over time without polluting the chat-like update feed.

**Read-model note**: the Task Detail screen's timeline (which visually
interleaves "Ahmed started reviewing the contract" alongside "Ahmed
completed the task") is produced by **merging `TaskUpdate` +
`TaskActivity`, sorted by `CreatedAt`, at query time** — not by storing
system events inside `TaskUpdate`. `GET /tasks/:id/updates` returns this
merged view.

---

## 4. Shared (used by both Tasks and Chat)

### Attachment
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| OwnerType | enum(`TaskUpdate`, `Message`) | Polymorphic owner |
| OwnerId | Guid | |
| UploaderId | Guid (FK → User) | |
| FileName | string | |
| FileSize | long | Bytes |
| MimeType | string | |
| StorageUrl | string | Object-storage key/URL, signed at read time |
| CreatedAt | DateTimeOffset | |

One upload pipeline for both task files and chat files/images/voice notes
(backend-architecture.md §8).

### Mention
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| OwnerType | enum(`TaskUpdate`, `Message`) | Polymorphic owner |
| OwnerId | Guid | |
| MentionedUserId | Guid (FK → User) | |
| CreatedAt | DateTimeOffset | |

One mention model for both task updates and chat messages — avoids two
near-identical tables.

---

## 5. Chat module — **V1 scope per D1: simple 1:1 only**

### Conversation
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| ParticipantAId | Guid (FK → User) | |
| ParticipantBId | Guid (FK → User) | |
| CreatedAt | DateTimeOffset | |
| LastMessageAt | DateTimeOffset? | Denormalized, for inbox sorting |

Two FK columns, not a join table — group chat is explicitly excluded (D1),
so there's no cardinality beyond two participants to model. Unique
constraint on the normalized pair (`LEAST(ParticipantAId, ParticipantBId)`,
`GREATEST(...)`) prevents duplicate conversations between the same two
users.

### Message
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| ConversationId | Guid (FK → Conversation) | |
| SenderId | Guid (FK → User) | |
| Type | enum(`Text`, `Image`, `File`, `Voice`) | Emoji are plain Unicode text, not a separate type |
| Text | string? | |
| CreatedAt | DateTimeOffset | |
| ReadAt | DateTimeOffset? | |
| SharedTaskId | Guid? (FK → Task) | "Share Task" action |
| SharedProjectId | Guid? (FK → Project) | "Share Project" action |
| ConvertedToTaskId | Guid? (FK → Task) | Set when "Convert message to Task" was used on this message |

Attachments and mentions go through the shared tables in §4, keyed by
`OwnerType = Message`.

**Not built** (dropped from the coded prototype, not part of D1's approved
list): `Poll`, `PollOption`, `PollVote`. No group chat, no voice/video call
entities (D1, D6).

---

## 6. Invites module

### Invite
Single generic table — replaces what would otherwise be two near-duplicate
`TaskExternalInvite`/`ProjectExternalInvite` tables.
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| InviterId | Guid (FK → User) | |
| Phone | string | Normalized E.164 |
| Label | string? | Optional display name given at invite time |
| ContextType | enum(`Task`, `Project`, `Direct`) | `Direct` = plain "invite this person to TaskUp" from Contacts Settings, not tied to a task/project |
| ContextId | Guid? | Null when `ContextType = Direct` |
| Status | enum(`Pending`, `Joined`) | |
| SentAt | DateTimeOffset | |
| JoinedAt | DateTimeOffset? | |
| JoinedUserId | Guid? (FK → User) | Set by the reconciliation job on registration (D8) |

Reconciliation: on `POST /auth/otp/verify` with `isNewUser = true`, find all
`Invite` rows with `Phone == new user's phone AND Status == Pending`, set
`JoinedUserId`/`JoinedAt`/`Status = Joined`, and — for `ContextType = Task`
— insert a `TaskParticipant` row (or set `Task.OwnerId` if that was the
original intent, tracked separately at invite time if needed); for
`ContextType = Project` — insert a `ProjectMember` row.

---

## 7. Notifications module

### Notification
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| UserId | Guid (FK → User) | Recipient |
| Category | enum — see below | |
| RelatedTaskId | Guid? (FK → Task) | |
| RelatedProjectId | Guid? (FK → Project) | |
| RelatedConversationId | Guid? (FK → Conversation) | |
| Text | string | Denormalized display text |
| IsRead | bool | |
| CreatedAt | DateTimeOffset | |

### NotificationCategory (enum, shared by Notification + NotificationPreference)
`TaskAssigned | TaskUpdated | Mention | DueDateOverdue | ProjectUpdates | NewMessage`
— the D3 list plus `NewMessage`, added per the locked assumption in §12
(Chat is in V1 and needs a notification category like everything else).

### NotificationPreference
Normalized per-category table, not fixed boolean columns — chosen
specifically so a new category is an enum value + a seed migration, not a
schema change (D3 explicitly asks for future extensibility).
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| UserId | Guid (FK → User) | |
| Category | enum(`NotificationCategory`) | |
| Enabled | bool | |

Unique constraint on `(UserId, Category)`; a row is seeded per category at
registration with the default from §7 of `backend-architecture.md`.

### NotificationDeliverySettings
One row per user — delivery-channel toggles, not categories.
| Field | Type | Notes |
|---|---|---|
| UserId | Guid (PK, FK → User) | |
| Sound | bool | |
| Vibration | bool | |
| Preview | bool | |
| WeeklyEmail | bool | |

---

## 8. Task AI module — **V1 scope per D5: Summary, Risk, Suggestions only**

### Subscription
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| UserId | Guid (FK → User) | |
| Plan | enum(`TaskAI`) | Single plan today |
| Status | enum(`Trialing`, `Active`, `Canceled`, `Expired`) | |
| StartedAt | DateTimeOffset | |
| RenewsAt | DateTimeOffset? | |

### AIFeatureTrialUsage
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| UserId | Guid (FK → User) | |
| Feature | enum(`Summary`, `Risk`, `Suggestions`) | Only the three in-scope features have values today; extend when a Future/V2 feature actually ships |
| UsedAt | DateTimeOffset | |

### AITaskSummary
| Field | Type | Notes |
|---|---|---|
| TaskId | Guid (PK, FK → Task) | One cached summary per task |
| Text | string | |
| GeneratedAt | DateTimeOffset | |

### AIRiskFlag
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| TaskId | Guid (FK → Task) | |
| Text | string | |
| DetectedAt | DateTimeOffset | |
| DismissedAt | DateTimeOffset? | |

### AISuggestion
| Field | Type | Notes |
|---|---|---|
| Id | Guid (PK) | |
| TaskId | Guid (FK → Task) | |
| Text | string | Suggested action text |
| Status | enum(`Pending`, `Accepted`, `Dismissed`) | |
| AcceptedChecklistItemId | Guid? (FK → TaskChecklistItem) | Set when accepted — **this is the resolved "Add action" target (D2 + D5)**: accepting a suggestion creates a `TaskChecklistItem` and links back here |
| CreatedAt | DateTimeOffset | |

**No entities for**: AI Task Creation, Voice to Task, Meeting Summary,
Daily Manager Report, AI Project Summary, AI Search — Future/V2, zero schema
committed now (D5).

---

## 9. Entities deliberately NOT created (and why)

| Not created | Why |
|---|---|
| `Subtask` | Replaced by `TaskChecklistItem` directly under Task (D2) |
| `TaskExternalInvite` / `ProjectExternalInvite` | Unified into single generic `Invite` (§6) |
| `Poll` / `PollOption` / `PollVote` | Dropped from the prototype; not in D1's approved chat feature list |
| `ContactBook` / raw contact list table | Never persisted server-side — stateless hash-match only (D8) |
| `Role` / `Permission` / `PermissionGrant` | No roles engine in V1 — fixed rules only (D7) |
| `Workspace` / `Organization` / `Tenant` | Product has no such boundary (contract §0) |
| `GroupChat` / `Channel` / `Call` / `Meeting` | Explicitly out of scope (D1, D6) |
| `MessageReaction` | Not requested anywhere in D1's scope list |
| Separate `en`/localized columns on Task/Project/Message | User content is single-language as typed; bilingual strings are frontend UI copy only (contract §15.11) |

---

## 10. Relationships (ERD)

```
User 1──* Device
User 1──* Session
User 1──* Consent
User 1──* Project (CreatedById)
User 1──* ProjectMember *──1 Project
User 1──* Task (CreatedById)
User 0..1──* Task (OwnerId)
User 1──* TaskParticipant *──1 Task
User 1──* TaskUpdate (AuthorId)
User 0..1──* TaskActivity (ActorId)
User 1──* TaskChecklistItem (CompletedById, nullable)
User 1──* Attachment (UploaderId)
User 1──* Mention (MentionedUserId)
User 1──* Conversation (as ParticipantA or ParticipantB)
User 1──* Message (SenderId)
User 1──* Invite (InviterId)
User 0..1──* Invite (JoinedUserId, once resolved)
User 1──* Notification
User 1──* NotificationPreference
User 1──1 NotificationDeliverySettings
User 0..1──1 Subscription
User 1──* AIFeatureTrialUsage

Project 0..1──* Task            -- Task.ProjectId is nullable
Project 1──* Message (SharedProjectId, nullable)

Task 1──* TaskParticipant
Task 1──* TaskChecklistItem
Task 1──* TaskUpdate
Task 1──* TaskActivity
Task 0..1──* Message (SharedTaskId, nullable)
Task 0..1──1 Message (ConvertedToTaskId, nullable, reverse)
Task 1──0..1 AITaskSummary
Task 1──* AIRiskFlag
Task 1──* AISuggestion

TaskUpdate 1──* Attachment (via OwnerType=TaskUpdate)
TaskUpdate 1──* Mention (via OwnerType=TaskUpdate)
Message 1──* Attachment (via OwnerType=Message)
Message 1──* Mention (via OwnerType=Message)

Conversation 1──* Message

AISuggestion 0..1──1 TaskChecklistItem (AcceptedChecklistItemId)
```

Cardinality call-outs that are hard product requirements, not incidental
modeling choices:
- `Task.OwnerId` is **exactly one person, nullable** — never a list
  (contract §7/D7; matches spec §38's "شخص واحد فقط").
- `Task.ProjectId` is **optional** — a task must be fully functional at
  `null` (spec Principle 3).
- `Conversation` is strictly two participants — no join table, no group
  cardinality (D1).
- `TaskChecklistItem` has no relations of its own beyond `TaskId` and the
  two nullable `User` FKs for completion tracking — deliberately flat (D2).

---

## 11. Permissions model (D7) — full matrix

| Action | Task Creator | Task Owner | Task Participant | Project Owner/Creator | Project Member (not on task) |
|---|---|---|---|---|---|
| View task | ✅ | ✅ | ✅ | ✅ (if task belongs to their project) | ✅ (if task belongs to their project) |
| Edit task settings (title, description, due date, project) | ✅ | ❌ | ❌ | — | — |
| Change Owner | ✅ | ❌ *(open — see below)* | ❌ | — | — |
| Add/remove Participants | ✅ | ❌ *(open — see below)* | ❌ | — | — |
| Change task status (start/complete/reopen) | ❌ *(unless also Owner)* | ✅ | ❌ | — | — |
| Add/complete/reopen checklist items | ✅ | ✅ | ❌ *(inferred — see note)* | — | — |
| Add updates / attach files | ✅ | ✅ | ✅ | — | — |
| Delete task | ✅ | ❌ | ❌ | — | — |
| Create a task inside a project | — | — | — | ✅ | ✅ (becomes that task's Creator) |
| Manage project members | — | — | — | ✅ | ❌ |
| Edit project settings | — | — | — | ✅ | ❌ |

**Notes on inferences not verbatim stated by D7**:
- *Checklist mutation restricted to Creator+Owner*: D7 says the Owner
  "يستطيع تحديث المهمة وتنفيذها" (updates and executes the task) and
  Participants only "يستطيعون إضافة Updates وFiles" — checklist management
  reads as part of executing the task, not filed under Updates/Files, so
  it's scoped to Creator+Owner. Flag if Participants should also manage
  checklist items.
- *Owner cannot reassign Owner or manage participants*: D7's phrase "لا
  يستطيعون تغيير Owner إلا إذا كان لديهم صلاحية" (participants can't change
  Owner unless they have permission) implies some role *can* have that
  permission beyond Creator, but no second role exists in V1 (no roles
  engine, D7's own closing line). Defaulted to Creator-only until a
  permission-grant mechanism is designed. Both are single named constants in
  the authorization policy (`backend-architecture.md` §4) so this is a
  one-line flip, not a refactor, if the answer is "yes, Owner too."

**Chat**: strictly the two `Conversation` participants; no exceptions.

**No global admin/staff role** exists in this model — out of scope.

---

## 12. Assumptions locked (2026-08-10) — implementation proceeds on these

Per instruction, the five items below are now **locked as working decisions**
so implementation can proceed. Recorded here (not silently assumed) so
they're easy to revisit:

1. **Due-date resolution** — resolved server-side in Asia/Riyadh time.
   `Today` = end of current day, `Tomorrow` = end of next day, `This week` =
   end of day Saturday (week = Sun–Sat), `Next week` = end of day Saturday
   the week after.
2. **Delete = soft-delete/archive**, not a hard delete. `Task.DeletedAt` /
   `Project.DeletedAt` are the real mechanism; nothing is physically removed,
   consistent with "never delete history" (spec §31). Deleted/archived tasks
   and projects are excluded from default list/search queries but remain
   fetchable by id for anyone who already had access.
3. **`NotificationCategory.NewMessage` added** to the enum (§7) — Chat
   generates notifications through this category like everything else.
4. **Checklist mutation = Creator + Owner only**, not Participants. Matches
   the §11 permission matrix as written.
5. **Owner-reassignment and participant-management = Creator only.** Owner
   cannot reassign themselves or manage participants in V1.

These are reflected directly in the entities/enums above and in the
implementation.

---

*This is the domain model migrations should be written against. Items in
§11 should be confirmed before the specific endpoints they affect ship, but
do not block starting implementation of the rest of the system.*
