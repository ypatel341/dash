# DASH Task System V1

## Engineering Design Document

**Status:** V1 shipped; V1.1 shipped; V1.2 in progress — Revision 1.5  
**Date:** 2026-08-18  
**Scope:** Task planning, recurring task instances, categories, simple CRUD, calendar projection, unit testing strategy, responsive UI, month browsing, and infrequent recurrence  
**V1 field test:** July 29–August 4, 2026 (see `docs/retros/TODO-feature/`)

---

## 1. Summary

DASH will add a task-planning system focused on meaningful daily commitments rather than micro-task management.

The system will support:

- One-time tasks
- Recurring task series
- Stored task occurrences
- Per-occurrence completion, skipping, cancellation, or deletion behavior
- Category-based color coding
- Task kind and modality
- A simple create/edit form
- A calendar view derived from tasks

The central design decision is:

> A recurring series is a definition that produces concrete task records. The calendar and dashboard display task records, not series definitions.

This allows one occurrence to be changed or canceled without breaking the remaining series.

---

## 2. Goals

1. Give the user and spouse a shared view of meaningful daily commitments.
2. Keep `tasks` as the source of truth for individual agenda items.
3. Support recurring items without making recurrence part of the task category.
4. Preserve historical task snapshots after a recurring series changes.
5. Keep the first UI simple enough to learn from real usage.
6. Avoid schema choices that block future reminders, dependencies, habits, richer recurrence editing, or normalized user identities.

---

## 3. Non-goals for V1

The following are intentionally deferred:

- Habit tracking
- Micro-task/checklist management
- Task dependencies
- Notification and reminder delivery
- Email digests
- External calendar synchronization
- ~~Editing “this and future occurrences”~~ — V1.1 PR2 implemented edit scope: “this occurrence” vs “entire series” with series reconciliation
- Complex recurrence exceptions
- Arbitrary user-defined task fields
- Automated prioritization
- AI scheduling

These can be layered on later without changing the core task/series relationship.

---

## 4. Product Principles

### 4.1 Tasks represent meaningful commitments

DASH is not intended to replace handwritten micro-task lists.

A task should generally be important enough to affect how the day is planned, including:

- Meetings
- Interviews
- Therapy
- Parties and events
- Bill due dates
- Home maintenance
- Religious events
- Workouts
- Other meaningful commitments

Importance is a product guideline, not a database column in V1.

### 4.2 Everything remains a task

The primary entity will continue to be called `task`.

Different behavior is expressed through:

- `kind`
- `category`
- `modality`
- scheduling fields
- recurrence membership

### 4.3 Calendar is a projection

The calendar does not own separate calendar-event records.

It displays tasks whose dates overlap the selected calendar range.

---

## 5. Domain Model

### 5.1 Task

A concrete agenda item.

A task may be:

- One-time: `series_id IS NULL`
- Recurring occurrence: `series_id IS NOT NULL`

A recurring task contains a snapshot of the series values at generation time.

### 5.2 Task Series

A recurrence definition that produces concrete tasks.

The series stores:

- Default title and description
- Default classification
- Default schedule shape
- Recurrence rule
- Series status
- Generation progress

The series itself is not displayed on the calendar.

### 5.3 Task Category

The area of life represented by the task.

Initial seeded categories:

- Work
- Social
- Home
- Finance
- Spiritual
- Fitness
- Health
- Other

Category drives primary UI color.

### 5.4 Task Kind

The behavioral shape of the task.

Initial values:

- `event`
- `deadline`
- `activity`

Examples:

| Example                 | Kind     |
| ----------------------- | -------- |
| Party                   | event    |
| Virtual interview       | event    |
| Therapy appointment     | event    |
| Bill due date           | deadline |
| HVAC filter replacement | activity |
| Workout                 | activity |

### 5.5 Modality

How the task occurs.

Initial values:

- `physical`
- `virtual`
- `none`

Modality should be represented through icons or secondary styling rather than the main category color.

---

## 5.6 Identity and assignment in V1

DASH does not currently have a normalized identity model. The baseline migration created `user` and `users_roles` tables, but these are unused scaffolding — no application code references them, and no data flows through them. Existing expense records use the string values:

```text
Yogi
Riddhi
Both
```

The task feature should follow the current application model for V1 instead of blocking delivery on a broader identity migration.

Tasks and task series will therefore use:

```text
assigned_to VARCHAR
```

Initial application-supported values:

```text
Yogi
Riddhi
Both
```

This field represents **who the task is for**, not a foreign key to a user.

`Both` is especially important: it is not a third user and should never be migrated to its own user UUID. In a normalized future model it becomes two assignment rows, one for each user.

Task categories are household-wide in V1 and do not require a `user_id`.

A future identity migration can either extend the existing `user` table or replace it. The decision depends on whether the current schema (email, first/last name, role FK) fits the household model. Either way, the migration path from `assigned_to VARCHAR` remains the same:

```text
users (new or extended from existing `user` table)
- id UUID
- display_name
- ...

task_assignees
- task_id UUID
- user_id UUID
```

Migration behavior:

```text
Yogi   -> one task_assignees row for Yogi
Riddhi -> one task_assignees row for Riddhi
Both   -> two task_assignees rows
```

The expense identity migration should be tracked separately because an expense field may mean payer, owner, beneficiary, or shared responsibility rather than task assignment.

This future migration is intentionally not a prerequisite for Task Planning V1.

---

## 6. Recurrence Model

### 6.1 Stored occurrences

Recurring tasks are stored as concrete rows in `tasks`.

```text
task_series
  ├── task occurrence
  ├── task occurrence
  ├── task occurrence
  └── task occurrence
```

This allows an individual occurrence to be completed, skipped, moved, canceled, or hidden without changing the series definition.

### 6.2 Original occurrence identity

Every generated occurrence stores the date it originally represented:

```text
original_occurrence_date
```

Example:

- Original occurrence: 2026-08-10
- User moves it to: 2026-08-11

The task retains:

```text
original_occurrence_date = 2026-08-10
task_date = 2026-08-11
```

This prevents the generator from recreating the August 10 occurrence.

### 6.3 Idempotency

The database must enforce:

```text
UNIQUE (series_id, original_occurrence_date)
WHERE series_id IS NOT NULL
```

Running generation repeatedly must not create duplicates.

### 6.4 Rolling materialization

Do not generate recurring tasks indefinitely — with one exception for infrequent recurrences (see below).

Default horizon:

```text
90 days (daily, weekly, monthly, quarterly)
```

Yearly and semi-annual series use an extended horizon:

```text
2050-12-31 (yearly and semi-annual only)
```

The rationale: a birthday or annual renewal saved today won't have next year's occurrence in the database under a 90-day window. The 2050 horizon eagerly creates all occurrences at series creation time, guaranteeing data exists for calendar display and far-future browsing. The `endsOn` field on the series is authoritative — if a series ends before 2050, materialization stops at the end date, not 2050. See Appendix B for the full product decision record.

The system generates missing occurrences through a target date and records progress in:

```text
generated_through
```

Generation runs:

- When a series is created
- When a series is resumed from paused state
- When a series schedule is updated (deletes future planned occurrences, resets `generated_through`, re-materializes)
- When upcoming tasks are requested (lazy materialization through the requested date range)

### 6.5 Series and occurrence status

Series status:

- `active`
- `paused`
- `ended`
- `archived`

Task occurrence status:

- `planned`
- `completed`
- `skipped`
- `canceled`

`overdue` should be derived when:

```text
status = planned
AND task_date < current_date
```

It should not be stored as a mutable status.

### 6.6 Deleting one occurrence

For generated recurring tasks, cancellation is safer than physical deletion:

```text
status = canceled
is_exception = true
```

This preserves the original occurrence identity and prevents regeneration.

Hard deletion may remain available for accidental one-time task creation, but recurring occurrences should normally be canceled.

---

## 7. Scheduling Model

V1 should use a date plus optional local times instead of forcing every item into a timestamp.

This supports:

- Timed events
- Date-only deadlines
- All-day events

Recommended fields:

```text
task_date
time_mode
start_time
end_time
```

Initial `time_mode` values:

- `timed`
- `all_day`
- `date_only`

Examples:

| Task         | time_mode | task_date  | start_time | end_time |
| ------------ | --------- | ---------- | ---------- | -------- |
| Interview    | timed     | 2026-08-05 | 14:00      | 15:00    |
| Diwali       | all_day   | 2026-11-08 | null       | null     |
| Mortgage due | date_only | 2026-08-01 | null       | null     |

Timezone support can initially default to the user profile. A series-level timezone may be added when recurrence generation or external calendar synchronization requires it.

---

## 8. Proposed Tables

## 8.1 `task_categories`

Stores user-visible life categories and display metadata.

| Column       | Type                  | Notes                                         |
| ------------ | --------------------- | --------------------------------------------- |
| `id`         | uuid                  | Primary key                                   |
| `name`       | varchar               | Display name                                  |
| `slug`       | varchar               | Stable identifier                             |
| `color_key`  | varchar               | MUI palette token (e.g. `primary`, `success`) |
| `icon_key`   | varchar, nullable     | Optional icon                                 |
| `sort_order` | integer               | Display order                                 |
| `is_active`  | boolean               | Hide without deleting                         |
| `created_at` | timestamptz           |                                               |
| `updated_at` | timestamptz           |                                               |
| `deleted_at` | timestamptz, nullable | Soft delete (matches existing pattern)        |

Constraints:

```text
UNIQUE (slug)
```

Seed categories:

```text
work
social
home
finance
spiritual
fitness
health
other
```

---

## 8.2 `task_series`

Stores recurring task definitions and generation state.

| Column              | Type                  | Notes                                  |
| ------------------- | --------------------- | -------------------------------------- |
| `id`                | uuid                  | Primary key                            |
| `assigned_to`       | varchar               | Yogi, Riddhi, or Both in V1            |
| `title`             | varchar               | Default occurrence title               |
| `description`       | text, nullable        | Default description                    |
| `category_id`       | foreign key           | Default category                       |
| `kind`              | varchar               | event, deadline, activity              |
| `modality`          | varchar               | physical, virtual, none                |
| `location`          | varchar, nullable     | Physical or virtual location           |
| `time_mode`         | varchar               | timed, all_day, date_only              |
| `start_time`        | time, nullable        | Default local start time               |
| `end_time`          | time, nullable        | Default local end time                 |
| `starts_on`         | date                  | First eligible recurrence date         |
| `ends_on`           | date, nullable        | Optional series end                    |
| `recurrence_rule`   | text                  | RFC 5545-style RRULE                   |
| `status`            | varchar               | active, paused, ended, archived        |
| `generated_through` | date, nullable        | Materialization progress               |
| `metadata`          | jsonb                 | See section 9 for V1 contract          |
| `created_at`        | timestamptz           |                                        |
| `updated_at`        | timestamptz           |                                        |
| `deleted_at`        | timestamptz, nullable | Soft delete (matches existing pattern) |

Recommended checks:

```text
kind IN ('event', 'deadline', 'activity')
modality IN ('physical', 'virtual', 'none')
time_mode IN ('timed', 'all_day', 'date_only')
status IN ('active', 'paused', 'ended', 'archived')
```

Notes:

- `recurrence_rule` gives long-term flexibility without requiring every recurrence feature in the V1 form.
- The first UI can generate only simple RRULE patterns such as daily, weekly, monthly, or yearly.
- The application should validate that timed series have a `start_time`.

---

## 8.3 `tasks`

Stores every concrete agenda item.

| Column                     | Type                  | Notes                                  |
| -------------------------- | --------------------- | -------------------------------------- |
| `id`                       | uuid                  | Primary key                            |
| `assigned_to`              | varchar               | Yogi, Riddhi, or Both in V1            |
| `series_id`                | foreign key, nullable | Null for one-time tasks                |
| `original_occurrence_date` | date, nullable        | Stable recurrence identity             |
| `title`                    | varchar               | Snapshot title                         |
| `description`              | text, nullable        | Snapshot description                   |
| `category_id`              | foreign key           | Snapshot category                      |
| `kind`                     | varchar               | event, deadline, activity              |
| `modality`                 | varchar               | physical, virtual, none                |
| `status`                   | varchar               | planned, completed, skipped, canceled  |
| `task_date`                | date                  | Display date                           |
| `time_mode`                | varchar               | timed, all_day, date_only              |
| `start_time`               | time, nullable        |                                        |
| `end_time`                 | time, nullable        |                                        |
| `location`                 | varchar, nullable     |                                        |
| `is_exception`             | boolean               | Manually changed recurring occurrence  |
| `metadata`                 | jsonb                 | See section 9 for V1 contract          |
| `completed_at`             | timestamptz, nullable |                                        |
| `canceled_at`              | timestamptz, nullable |                                        |
| `created_at`               | timestamptz           |                                        |
| `updated_at`               | timestamptz           |                                        |
| `deleted_at`               | timestamptz, nullable | Soft delete (matches existing pattern) |

Recommended checks:

```text
kind IN ('event', 'deadline', 'activity')
modality IN ('physical', 'virtual', 'none')
status IN ('planned', 'completed', 'skipped', 'canceled')
time_mode IN ('timed', 'all_day', 'date_only')
```

Recommended indexes:

```text
INDEX (task_date)
INDEX (status, task_date)
INDEX (assigned_to, task_date)
INDEX (series_id)
UNIQUE (series_id, original_occurrence_date)
  WHERE series_id IS NOT NULL
```

Recommended integrity rules:

```text
series_id IS NULL AND original_occurrence_date IS NULL
OR
series_id IS NOT NULL AND original_occurrence_date IS NOT NULL

is_exception = false WHERE series_id IS NULL
```

The `is_exception` flag is only meaningful for recurring occurrences. One-time tasks should always have `is_exception = false`.

---

## 9. Why There Is No Generic `task_details` Table

A generic key/value table would make validation and querying harder.

Instead, V1 uses:

- Concrete columns for commonly queried fields
- `metadata JSONB` for uncommon or experimental fields

### V1 `metadata` contract

The `metadata` column on `tasks` and `task_series` should default to an empty object `{}` in V1. No application code should read or write to it yet.

Its purpose is to provide a migration-free path for V1.1 experimentation. If a field begins appearing consistently during the usage review (Ticket 6), it should be promoted to a concrete column via migration rather than remaining in JSONB.

The service layer should validate that `metadata` is a plain object (not an array or primitive) on write.

### Future structured extensions

A `task_details`-style table should only be introduced for a clear domain, such as:

- Notes
- Checklist entries
- Attachments
- Activity history

It should not be used as a generic home for arbitrary attributes.

---

## 10. Snapshot Behavior

Generated tasks copy the series defaults at creation time.

This preserves history.

When a series is edited (V1.1 PR2):

- **Data field changes** (title, description, assignedTo, category, kind, modality, timeMode, times, location): propagated to future planned non-exception occurrences via bulk update
- **Schedule changes** (startsOn, recurrenceRule): future planned non-exception occurrences are deleted, `generated_through` is reset, and occurrences are re-materialized
- Completed occurrences remain unchanged
- Manually changed exceptions (`is_exception = true`) remain unchanged

Editing an individual recurring occurrence sets `is_exception = true`, preventing future series edits from overwriting that occurrence. Status-only changes (complete, skip, cancel) do not set the exception flag.

---

## 11. Minimal API Surface

The first implementation can remain small.

Task routes are mounted under `/api/tasks`. A single `taskRoutes.ts` file defines all sub-routes.

The `/api` namespace was introduced in V1.1 to separate API routes from frontend SPA routes. Without it, direct browser navigation to `/tasks` was intercepted by Express before the SPA catch-all could serve `index.html`, returning a query-parameter validation error instead of the React page. All API routes now live under `/api` — budget (`/api/budget`), daily-word (`/api/daily-word`), and tasks (`/api/tasks`). Only `/health` remains at the root level.

### Categories

```text
GET    /api/tasks/categories
POST   /api/tasks/categories
PATCH  /api/tasks/categories/:id
```

### One-time tasks

```text
GET    /api/tasks?from=&to=&status=
POST   /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

### Recurring series

```text
GET    /api/tasks/series
POST   /api/tasks/series
GET    /api/tasks/series/:id
PATCH  /api/tasks/series/:id
POST   /api/tasks/series/:id/pause
POST   /api/tasks/series/:id/resume
POST   /api/tasks/series/:id/archive
```

### Occurrence generation

This can initially remain an internal service:

```text
ensureTaskOccurrences(throughDate)
```

The task listing endpoint may call it before querying the requested date range.

---

## 12. Simple V1 UI

UI is intentionally not the architectural focus.

The first version only needs:

### Task form

- Title
- Description
- Category
- Kind
- Modality
- Location
- Date
- Optional start and end time
- Recurring toggle
- Simple recurrence pattern
- Optional recurrence end date

### Task list

- Upcoming tasks
- Status update (complete, skip, cancel)
- Edit task via overflow menu (one-time or recurring with scope selector)
- Series lifecycle actions via overflow menu (pause, resume, archive)

### Calendar view

- Read-only projection of tasks
- Category-based colors
- Modality icons
- Click-through to task details

---

## 13. Unit Testing Strategy

This section covers unit testing for Task Planning V1. Integration and end-to-end testing strategies are tracked in a separate infrastructure document.

### Recurrence library

V1 will use the [`rrule`](https://www.npmjs.com/package/rrule) npm package for parsing, validating, and expanding RFC 5545 RRULE strings. It is the most widely adopted JS implementation, supports all standard recurrence patterns, and works in both Node and browser contexts. The form generates `FREQ=DAILY`, `FREQ=WEEKLY`, `FREQ=MONTHLY`, `FREQ=YEARLY`, and semi-annual (`FREQ=MONTHLY;INTERVAL=6`) rules — `rrule` handles these without configuration.

### What to test

Unit tests target the service layer (`taskService.ts`) and utility functions. They should not require a running database — mock the db-operation-helpers layer with Jest.

#### Service layer coverage

| Area              | What to assert                                                                        |
| ----------------- | ------------------------------------------------------------------------------------- |
| Task creation     | Validates required fields; rejects invalid `kind`, `modality`, `time_mode`, `status`  |
| Task creation     | Timed tasks require `start_time`; `all_day`/`date_only` ignore times                  |
| Task update       | Status transitions are valid (e.g. cannot complete a canceled task)                   |
| Task update       | Editing data fields on a recurring task sets `is_exception = true`                    |
| Task update       | Status-only changes on a recurring task do not set `is_exception`                     |
| Task update       | Editing a one-time task does not set `is_exception`                                   |
| Task deletion     | One-time tasks can be hard-deleted; recurring occurrences are canceled, not deleted   |
| Task listing      | Filters by date range and status; returns correct shape                               |
| Series creation   | Validates RRULE via `rrule` library; rejects malformed rules                          |
| Series creation   | Generates occurrences through the frequency-aware horizon                             |
| Materialization   | Idempotent — running twice produces no duplicates                                     |
| Materialization   | Respects `generated_through` and only fills the gap                                   |
| Materialization   | Skips dates with existing canceled exceptions                                         |
| Materialization   | Yearly/semi-annual series materialize through 2050; others through 90 days            |
| Materialization   | `endsOn` before 2050 is authoritative — materialization stops at the end date         |
| Series pause      | Paused series stop generating future occurrences                                      |
| Series resume     | Resumed series regenerate from where they left off                                    |
| Snapshot behavior | Generated occurrences copy series defaults at creation time                           |
| Series update     | Field changes propagate to future planned non-exception occurrences                   |
| Series update     | Schedule changes delete future planned tasks and re-materialize                       |
| Reconciliation    | Non-planned occurrences (completed, skipped, canceled, edited) survive reconciliation |
| Reconciliation    | Completing one occurrence leaves the series and future occurrences intact             |
| Metadata          | Rejects non-object values (arrays, primitives)                                        |

#### Utility coverage

| Area               | What to assert                                                           |
| ------------------ | ------------------------------------------------------------------------ |
| RRULE helpers      | Simple form values map to valid RRULE strings                            |
| Date helpers       | Occurrence date calculations respect `starts_on` and `ends_on`           |
| Validation helpers | `assigned_to` rejects values outside `Yogi`, `Riddhi`, `Both`            |
| Integrity          | `series_id` and `original_occurrence_date` are both present or both null |

### Conventions

- Test files live in `src/__tests__/` alongside existing tests
- File naming: `taskService.test.ts`, `taskUtils.test.ts`
- Run with: `npx jest src/__tests__/taskService.test.ts --detectOpenHandles`

---

## 14. Delivery Plan and Tickets

## Epic: Task Planning V1

### Ticket 1 — Database foundation

**Purpose:** Create the core data model.

**Depends on:** None

Deliverables:

- `task_categories` migration
- `task_series` migration
- `tasks` migration
- All constraints, indexes, and check constraints
- Seed default categories
- Migration rollback
- Basic model documentation

Unit tests:

- Migration applies and rolls back cleanly
- Constraints reject invalid data (duplicate occurrence dates, invalid enums)

Acceptance criteria:

- One-time tasks can exist without a series
- Recurring tasks require an original occurrence date
- Duplicate series occurrences are rejected
- Categories are shared across the current DASH household
- Task assignment supports Yogi, Riddhi, and Both without requiring a users table
- All tables include `deleted_at` for soft delete consistency

---

### Ticket 2 — One-time task CRUD and listing

**Purpose:** Establish the simplest usable vertical slice. This is the heaviest backend ticket — it stands up the full layer stack (`taskRoutes.ts` → `taskController.ts` → `taskService.ts` → db helpers).

**Depends on:** Ticket 1

Deliverables:

- `taskRoutes.ts`, `taskController.ts`, `taskService.ts`, task db helpers
- Create, read, update, delete for one-time tasks
- List tasks by date range with status filtering
- Status transitions (planned → completed, planned → skipped, planned → canceled)
- Field validation (required fields, enum values, time_mode/start_time consistency)
- Category CRUD (`GET /tasks/categories`, `POST`, `PATCH`)

Unit tests:

- Service validates required fields and rejects invalid enums
- Timed tasks require `start_time`; `all_day`/`date_only` ignore times
- Status transitions are valid (cannot complete a canceled task)
- Listing filters by date range and status correctly
- `metadata` rejects non-object values
- `assigned_to` rejects values outside `Yogi`, `Riddhi`, `Both`

Acceptance criteria:

- User can create a meaningful one-time task
- Date-only and timed tasks are supported
- Tasks can be filtered by date and status

---

### Ticket 3 — Recurring series and materialization

**Purpose:** Generate stored task instances from a recurrence definition.

**Depends on:** Ticket 2 (needs the task service layer and db helpers)

Deliverables:

- Series CRUD routes (`/tasks/series/*`)
- RRULE validation and parsing via the `rrule` library
- `ensureTaskOccurrences(throughDate)` — generates occurrences through a 90-day horizon
- Idempotent insertion (respects `original_occurrence_date` uniqueness)
- Track `generated_through`
- Pause, resume, and archive series actions
- Task listing calls `ensureTaskOccurrences` before querying

Unit tests:

- Series creation validates RRULE; rejects malformed rules
- Generation produces correct occurrence dates for daily/weekly/monthly/yearly
- Idempotent — running twice produces no duplicates
- Respects `generated_through` and only fills the gap
- Skips dates with existing canceled exceptions (`is_exception = true`)
- Paused series stop generating future occurrences
- Resumed series regenerate from where they left off
- Generated occurrences snapshot series defaults at creation time

Acceptance criteria:

- Re-running generation creates no duplicates
- Each occurrence is independently editable at the task level
- Paused series stop generating future occurrences

---

### Ticket 4 — Basic task management UI

**Purpose:** Make the feature usable before adding presentation complexity.

**Depends on:** Ticket 3 (the UI includes recurrence controls that require the series API)

Deliverables:

- Task create/edit form
- Recurrence toggle with simple daily/weekly/monthly/yearly controls
- Optional recurrence end date
- Upcoming task list (one-time and generated occurrences together)
- Complete, skip, and cancel actions
- Category selector with color indicators

Acceptance criteria:

- User and spouse can enter and manage tasks without database access
- Generated occurrences appear alongside one-time tasks

---

### Ticket 5 — Dashboard and calendar projection

**Purpose:** Surface tasks through DASH's command-center experience.

**Depends on:** Ticket 4

Deliverables:

- Today's meaningful tasks on the homepage
- Upcoming section
- Calendar query and view
- Category colors (using MUI palette tokens from `color_key`)
- Modality indicators (icons)

Acceptance criteria:

- Dashboard and calendar read from the same `tasks` source of truth
- No duplicate calendar-event storage is introduced

---

### Ticket 6 — Usage review and V1.1 decisions

**Purpose:** Learn from real behavior before expanding the schema.

**Depends on:** Tickets 1–5 deployed and used for two to four weeks

Review areas:

- Which categories are actually used?
- Are kind and modality useful?
- Are users canceling, skipping, or deleting occurrences?
- Do tasks need manual ordering?
- Are date-only and timed modes sufficient?
- Is “edit this and future” now necessary?
- Are reminders needed only for rare high-value tasks?
- Does JSONB contain repeated fields that deserve columns?

The output should be a short V1.1 architecture decision record rather than immediate feature expansion.

---

### Separate future ticket — Normalize users and household assignments

**Purpose:** Replace string-based identities across DASH with UUID-backed users after the task feature has been validated through real usage.

Deliverables:

- Create `users` with UUID primary keys
- Seed/migrate Yogi and Riddhi
- Create `task_assignees`
- Migrate task values, expanding `Both` into two rows
- Define the correct normalized model for expense ownership/payment responsibility
- Migrate expense strings separately
- Remove deprecated string identity fields after verification

This ticket is intentionally outside Task Planning V1 and should not block the first usable release.

---

## 15. Suggested Pull Request Boundaries

A practical implementation can be delivered in three pull requests. Ticket 6 (usage review) produces a decision document, not a PR.

| PR   | Tickets       | Contents                                                                               |
| ---- | ------------- | -------------------------------------------------------------------------------------- |
| PR 1 | Tickets 1 + 2 | Migrations, seed categories, full task CRUD + listing, category CRUD, unit tests       |
| PR 2 | Ticket 3      | Series CRUD, RRULE handling via `rrule`, occurrence materialization, idempotency tests |
| PR 3 | Tickets 4 + 5 | Task form, task list, recurrence UI, dashboard integration, calendar projection        |

This keeps recurrence complexity from blocking the first usable task flow.

---

## 16. Deferred Extension Points

The design allows later addition of:

### Reminders

```text
task_notifications
- task_id
- channel
- scheduled_at
- sent_at
```

### Dependencies

```text
task_dependencies
- task_id
- depends_on_task_id
```

### Notes

```text
task_notes
- task_id
- body
- created_at
```

### Series splitting

V1.1 PR2 implemented “this occurrence” vs “entire series” editing. The remaining deferred capability is “this and future occurrences” — ending the original series at a chosen occurrence and creating a new series for the remainder.

### External calendars

External calendar identifiers can be added to tasks without changing the task/series relationship.

### Shared ownership

A future join table can support tasks shared between household members if `user_id` ownership becomes too restrictive.

---

## 17. Open Questions Before Migration

These do not block the EDD, but should be answered before finalizing the migration:

1. Should both spouses see all tasks by default, with assignment used only as a filter or visual indicator?
2. ~~Does the existing application have a standard soft-delete pattern?~~ **Resolved:** Yes — `deleted_at` columns exist on `budget_monthly_expenses`, `user`, and `users_roles`. Task tables now include `deleted_at`.
3. Should `location` contain both physical locations and virtual URLs, or should `virtual_url` become a separate column?
4. ~~Should recurring task occurrences be physically editable in V1, or only completable/skippable/cancelable?~~ **Resolved:** V1.1 PR2 added occurrence editing with `is_exception` flag and series-level editing with reconciliation.
5. ~~Which recurrence library will parse and generate RRULE values?~~ **Resolved:** `rrule` npm package. See section 13.
6. Should `assigned_to` remain application-validated only, or use a temporary database check constraint?

---

## 18. Recommendation

The architecture is mature enough to begin table design and ticketing.

The recommended order is:

1. Review and approve this EDD
2. Confirm V1 assignment behavior for Yogi, Riddhi, and Both
3. Write UUID-based migrations
4. Build one-time task CRUD
5. Add recurrence generation
6. Add the minimal UI
7. Use it before expanding the model
8. Normalize users later through a separate cross-feature migration

The first migration should remain narrow, but the task/series split, original occurrence identity, category separation, snapshot model, and explicit temporary assignment string should be treated as intentional foundational decisions. The string assignment is a migration seam, not the permanent identity model.

---

## Appendix A: UI Implementation Notes (PR 3A-C)

### Frontend file inventory

| File                                                 | Purpose                                                                                                   |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/app/tasks-page/TasksHomePage.tsx`               | Top-level route: 2-column Grid (list + calendar), FAB, toast                                              |
| `src/app/tasks-page/components/TaskForm.tsx`         | Dialog-based create/edit form with recurrence toggle and edit scope selector                              |
| `src/app/tasks-page/components/TaskFormFields.tsx`   | Reusable field wrappers: SelectField, CategoryField, DateField, TimeField                                 |
| `src/app/tasks-page/components/TaskRow.tsx`          | Task row with complete button, overflow menu (edit, skip, cancel, delete, series actions), confirm dialog |
| `src/app/tasks-page/components/UpcomingTaskList.tsx` | Fetches tasks for today+14 days, groups by date, assignee/status filters, passes onEdit                   |
| `src/app/tasks-page/components/CalendarView.tsx`     | MUI DateCalendar with category-colored badge dots, day detail panel                                       |
| `src/app/tasks-page/components/TodayTasksCard.tsx`   | Landing page card showing today's planned tasks                                                           |
| `src/app/tasks-page/utils/taskApi.ts`                | Typed axios helpers for all `/api/tasks` endpoints                                                        |
| `src/app/home-page/components/LandingPage.tsx`       | Landing page wrapper: WordOfTheDay + TodayTasksCard                                                       |
| `src/app/i18n/en.ts`                                 | `tasksPage` block with all UI strings                                                                     |

### Patterns

- **MUI `sx` prop** for all styling; no Tachyons
- **`data-testid` attributes** on all key elements for Cypress selectors
- **`aria-label`** on all action IconButtons and the FAB
- **Confirm dialog** gates delete and cancel actions (not skip/complete)
- **Overflow menu** (`⋮` MoreVert) groups edit, skip, cancel, delete, and series lifecycle actions; complete button stays visible outside the menu
- **Edit scope dialog** for recurring tasks asks "This occurrence" vs "Entire series" before submitting
- **Server-side filtering** via query params (`status`, `assignedTo`) rather than client-side
- **Trailing-slash defense** on `REACT_APP_API_URL` in taskApi.ts
- **`displayMap`** on SelectField for translating enum values to human labels
- **Category colors** mapped via `colorKey` → MUI palette tokens (`primary.main`, etc.)

### Cypress E2E tests

Located in `cypress/e2e/tasks-page/`:

| File                      | Coverage                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `task-crud.cy.ts`         | Create task, complete, skip/unskip, cancel with confirm, delete with confirm, dismiss confirm, validation, filters, edit via overflow menu   |
| `series-flow.cy.ts`       | Create recurring series via form, cancel single occurrence, create semi-annual series (verifies RRULE), edit series to semi-annual frequency |
| `homepage-calendar.cy.ts` | Today card on landing page, "View all" navigation, calendar day detail, empty day state                                                      |
| `task-routing.cy.ts`      | Direct navigation to `/tasks`, browser refresh, API vs SPA route separation, delete-then-refresh recovery                                    |

Tests use the **real backend** pattern: `cy.request` for setup/cleanup, `cy.intercept` as spies to capture response data.

### Known limitations (V1, updated through V1.2)

- ~~Direct navigation to `/tasks` returned an API validation error~~ — fixed in V1.1 PR1 via `/api` namespace
- ~~Error state showed raw error text with no recovery~~ — fixed in V1.1 PR1 with retry button
- ~~No task edit UI (only create + status actions)~~ — fixed in V1.1 PR2 with edit via overflow menu and scope selector for recurring tasks
- ~~No series management UI (pause/resume/archive only via API)~~ — fixed in V1.1 PR2 with series lifecycle actions in overflow menu
- ~~Mobile task row titles overlap at narrow viewports~~ — fixed in V1.2 PR-A with responsive flex-wrap layout
- ~~No detail view for inspecting a full task record~~ — fixed in V1.2 PR-A with TaskDetailDialog (full-screen on mobile)
- ~~Hardcoded 14-day look-ahead for upcoming tasks~~ — fixed in V1.2 PR-B with month-based browsing and unlimited month pagination
- ~~Annual tasks disappear after 90 days~~ — fixed in V1.2 PR-C with frequency-aware materialization horizon (yearly/semi-annual → 2050)
- ~~No semi-annual frequency option~~ — fixed in V1.2 PR-C with "Every 6 months" in the frequency selector
- ~~Feb 29 birthdays skipped in non-leap years~~ — fixed in V1.2 PR-C with `BYMONTHDAY=-1` for leap day yearly tasks
- Calendar shows first category color only when multiple categories exist on a day
- Filter selectors use MUI Select which requires `[role="combobox"]` targeting in Cypress
- No drag-and-drop or reordering
- No "every N months" general capability — only explicit 6-month option (see Appendix B)

---

## Appendix B: V1.2 Product Decisions (PR-A through PR-C)

**Date:** 2026-08-18

These are intentional product choices made during V1.2 development. They're documented here because they would surprise a reader who encounters the behavior without context.

### B.1 Semi-annual month-end: day 30 keeps the literal day number

A task created on **June 30** with "Every 6 months" frequency produces **December 30** — not December 31, even though December 31 exists.

This is intentional. The RRULE uses `BYMONTHDAY=30`, which means "the 30th of the month." Only tasks starting on **day 31** use `BYMONTHDAY=-1` (last day of month), because day 31 doesn't exist in every month and needs the fallback.

The principle: if the user's chosen day exists in all relevant months, use it literally. Reserve last-day-of-month semantics for day 31 where the literal day genuinely doesn't exist in shorter months.

| Start date | RRULE stored    | 6 months later | Why                                                  |
| ---------- | --------------- | -------------- | ---------------------------------------------------- |
| Jun 30     | `BYMONTHDAY=30` | Dec 30         | 30 exists in December — use it                       |
| Aug 31     | `BYMONTHDAY=-1` | Feb 28 or 29   | 31 doesn't exist in February — fall back to last day |
| Jan 15     | `BYMONTHDAY=15` | Jul 15         | 15 exists everywhere — straightforward               |

**Edge case — day 30 in February:** A semi-annual task with `BYMONTHDAY=30` that lands in February will be skipped by the rrule library, because February doesn't have a 30th. This is acceptable — "the 30th" genuinely doesn't exist in February, and landing on the 28th when the user explicitly chose the 30th would be more surprising.

### B.2 Feb 29 birthdays: last day of February, not skipped

A yearly task created on **February 29** (a leap day) uses `FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1`, which produces:

- **Feb 29** in leap years (2028, 2032, ...)
- **Feb 28** in non-leap years (2025, 2026, 2027, ...)

This only applies to Feb 29 specifically. All other yearly dates (including Dec 31, Jun 30) use plain `FREQ=YEARLY` because they exist in every year.

The detection is explicit: `date.month() === 1 && date.date() === 29` — not a generic "is last day of month" check. This avoids accidentally triggering last-day semantics for dates like March 31, which the rrule library handles correctly for yearly recurrence since every year has a March 31.

### B.3 Materialization horizon: 2050, not infinity

Yearly and semi-annual series eagerly materialize all occurrences through **December 31, 2050** at creation time. Everything else stays at today + 90 days.

Why 2050 instead of infinity: the `INSERT ... ON CONFLICT DO NOTHING` idempotency guarantee and the finite date range keep row counts bounded and predictable. A yearly task from 2026 produces exactly 25 rows. A semi-annual from 2026-01-15 produces exactly 50.

Why not a longer horizon for all frequencies: a daily task through 2050 would produce ~8,900 rows per series — wasteful for something that only needs 90 days of look-ahead.

The `endsOn` field on the series is authoritative. A yearly series with `endsOn: 2030-12-31` materializes through 2030, not 2050. The horizon is a ceiling, not a mandate.

### B.4 "Every 6 months" is the only semi-annual option

V1.2 adds exactly one new frequency: "Every 6 months." There is no general "every N months" picker, no quarterly option, no "every 2 months."

This is intentional scope control. The semi-annual case is the same underlying concern as yearly — infrequent recurrences that disappear under a 90-day horizon. Quarterly (every 3 months) fits within the 90-day window, so it doesn't need the extended horizon and can stay as a future addition if needed.

The implementation maps `SEMI_ANNUAL` to `FREQ=MONTHLY;INTERVAL=6` in the RRULE. If a general "every N months" is added later, the RRULE representation already works — only the frontend selector and the horizon decision need to change.

### B.5 No birthday-specific behavior

Birthdays are ordinary annual tasks. There is no birthday category, birthday kind, age calculation, advance display ("turning 30 in 3 days"), or greeting functionality.

The task system handles birthdays through the same recurrence mechanics as any other yearly event. A birthday on Feb 29 gets the leap-day treatment (B.2), and a birthday on any other date gets plain `FREQ=YEARLY`.

### B.6 Responsive task rows: information hierarchy on mobile

At narrow viewports (below 600px), task rows hide the **assignee chip** and **status chips** (overdue, skipped, completed, canceled). These are always available by tapping the row to open the detail dialog.

The visible elements on mobile are: category chip, title (wraps to multiple lines), time/modality sub-line, and action buttons (Complete/Undo + overflow menu). This ensures the primary action (completing a task) is always reachable without scrolling.

### B.7 Month browsing is unlimited

The upcoming task list uses a `monthOffset` numeric state (0 = current month, 1 = next month, -1 = previous month) with no bounds. Users can page forward or backward indefinitely through `← Current →` navigation.

The current month view shows tasks from **today through end of month**. Any other month shows the **full month** (1st through last day). This means paging back to the current month always starts from today, not from the 1st — past tasks this month are not shown in the default view.

### B.8 Reconciliation preserves non-planned occurrences

When a series schedule is changed (startsOn or recurrenceRule), the system deletes **only future planned non-exception occurrences** and re-materializes. Completed, skipped, canceled, and manually edited (`is_exception = true`) occurrences are never touched.

This means a user who completed a task 3 months ago won't lose that history when they change the series frequency from weekly to daily. The `deleteFuturePlannedOccurrences` function filters on `status = 'planned' AND is_exception = false AND task_date >= today`.
