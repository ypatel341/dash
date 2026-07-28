# Task System V1 — PR 3 Handoff (UI Implementation)

**Date:** 2026-07-27
**Previous PRs:** PR 1 (DB + one-time CRUD), PR 2 (series CRUD + materialization)
**Branch base:** `main` (after PR 2 merge)
**EDD:** `docs/features/todo.md` (Revision 1.2)

---

## What's been built (backend, complete)

### API surface

All endpoints are live under `/tasks`:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/tasks?from=&to=&status=&assignedTo=` | List tasks in date range (triggers lazy materialization) |
| POST | `/tasks` | Create one-time task |
| GET | `/tasks/:id` | Get task by ID |
| PATCH | `/tasks/:id` | Update task fields or transition status |
| DELETE | `/tasks/:id` | Soft-delete (one-time) or cancel (recurring) |
| GET | `/tasks/categories` | List active categories | (tested)
| POST | `/tasks/categories` | Create category | (tested)
| PATCH | `/tasks/categories/:id` | Update category | (tested)
| GET | `/tasks/series` | List active series |
| POST | `/tasks/series` | Create series + initial 90-day materialization |
| GET | `/tasks/series/:id` | Get series by ID |
| PATCH | `/tasks/series/:id` | Update series data fields |
| POST | `/tasks/series/:id/pause` | Pause (stops future generation) |
| POST | `/tasks/series/:id/resume` | Resume (triggers materialization) |
| POST | `/tasks/series/:id/archive` | Archive (terminal) |

### Key behaviors

- **Lazy materialization:** `GET /tasks` automatically generates missing occurrences for active series through the `to` date before returning results. No separate cron needed.
- **Status transitions (tasks):** `planned → completed/skipped/canceled`, `skipped → planned`. Completed and canceled are terminal.
- **Status transitions (series):** `active → paused/ended/archived`, `paused → active/archived`, `ended → archived`. Archived is terminal.
- **DELETE on recurring occurrence:** Sets `status='canceled', is_exception=true` instead of soft-deleting. Prevents the materialization engine from regenerating the task.
- **Snapshot behavior:** Generated tasks copy series defaults at creation time. Updating a series does NOT retroactively change existing occurrences.
- **RRULE:** Stored as RFC 5545 text in `task_series.recurrence_rule`. V1 supports FREQ=DAILY, WEEKLY, MONTHLY, YEARLY.

### Database tables

| Table | Purpose |
|-------|---------|
| `task_categories` | 8 seed categories: Work, Social, Home, Finance, Spiritual, Fitness, Health, Other |
| `task_series` | Recurrence definitions with RRULE, status, generated_through tracking |
| `tasks` | Both one-time tasks and materialized occurrences |

### Seed categories and color mapping

| Category | slug | color_key | MUI palette token |
|----------|------|-----------|-------------------|
| Work | work | primary | `theme.palette.primary` |
| Social | social | secondary | `theme.palette.secondary` |
| Home | home | success | `theme.palette.success` |
| Finance | finance | warning | `theme.palette.warning` |
| Spiritual | spiritual | info | `theme.palette.info` |
| Fitness | fitness | error | `theme.palette.error` |
| Health | health | success | `theme.palette.success` |
| Other | other | default | `theme.palette.grey` |

### Domain types (from `src/server/utils/types.ts`)

**Task fields relevant to UI:**
`id, assignedTo, seriesId, title, description, categoryId, kind, modality, status, taskDate, timeMode, startTime, endTime, location, isException, metadata, completedAt, canceledAt`

**TaskSeries fields relevant to UI:**
`id, assignedTo, title, description, categoryId, kind, modality, location, timeMode, startTime, endTime, startsOn, endsOn, recurrenceRule, status, generatedThrough, metadata`

**Enums:**
- kind: `event | deadline | activity`
- modality: `physical | virtual | none`
- timeMode: `timed | all_day | date_only`
- status (task): `planned | completed | skipped | canceled`
- status (series): `active | paused | ended | archived`
- assignedTo: `Yogi | Riddhi | Both`

### CreateTaskRequest (POST /tasks)

```json
{
  "assignedTo": "Yogi",
  "title": "Dentist appointment",
  "categoryId": "<uuid>",
  "kind": "event",
  "modality": "physical",
  "taskDate": "2026-08-15",
  "timeMode": "timed",
  "startTime": "14:00",
  "endTime": "15:00",
  "description": "Annual checkup",
  "location": "Dr. Smith's office",
  "metadata": {}
}
```

### CreateSeriesRequest (POST /tasks/series)

```json
{
  "assignedTo": "Both",
  "title": "Weekly grocery run",
  "categoryId": "<uuid>",
  "kind": "activity",
  "modality": "physical",
  "timeMode": "all_day",
  "startsOn": "2026-08-01",
  "recurrenceRule": "FREQ=WEEKLY;BYDAY=SA",
  "location": "Costco"
}
```

### POST /tasks/series response shape

```json
{
  "series": { /* TaskSeries object */ },
  "tasks": [ /* Task[] — initially materialized occurrences */ ]
}
```

---

## Frontend conventions to follow

### Component structure

```
src/app/tasks-page/
  TasksHomePage.tsx           — top-level route (already exists as placeholder)
  components/                 — feature components
  utils/                      — helpers, API calls
```

### Patterns

- **React.FC** with hooks (`useState`, `useEffect`), no class components
- **API calls:** `axios` hitting `process.env.REACT_APP_API_URL` (e.g., `axios.get(\`${API_URL}/tasks?from=...\`)`)
- **Styling:** MUI `sx` prop, no Tachyons. Theme is dark mode (`src/app/theme.ts`)
- **i18n:** Plain object import from `src/app/i18n/en.ts` — add a `tasksPage` key block
- **Date library:** `dayjs` throughout
- **Date picker:** `@mui/x-date-pickers` `DatePicker` with `AdapterDayjs` already installed
- **State management:** Local component state, no Redux/context
- **Routing:** Currently flat `<Route path="/tasks" element={<TasksHomePage />} />` in App.tsx. Can be nested with an Outlet if needed (see budget pattern).

### Open questions from the EDD (still unresolved)

1. Should both spouses see all tasks, with `assignedTo` as a filter/indicator only?
3. Should `location` contain both physical and virtual URLs, or add a `virtual_url` column?
4. Should recurring occurrences be fully editable in V1, or only completable/skippable/cancelable?

---

## PR 3A — Task Form + Upcoming List + Actions

**Goal:** Make tasks usable without database access. Users can create, view, and act on tasks.

### Components to build

**TaskForm** — Create/edit form for tasks:
- Title (required, TextField)
- AssignedTo (Select: Yogi/Riddhi/Both)
- Category (Select, populated from `GET /tasks/categories`, show color chip)
- Kind (Select: event/deadline/activity)
- Modality (Select: physical/virtual/none)
- TaskDate (DatePicker)
- TimeMode (Select: timed/all_day/date_only)
- StartTime / EndTime (TimePicker, shown only when timeMode=timed)
- Location (optional TextField)
- Description (optional multiline TextField)
- **Recurrence toggle** — Switch to enable recurring mode:
  - When ON: shows frequency selector (Daily/Weekly/Monthly/Yearly) + starts_on + optional ends_on
  - Generates RRULE string from the simple controls (e.g., `FREQ=WEEKLY;BYDAY=MO`)
  - Submits to `POST /tasks/series` instead of `POST /tasks`
  - When OFF: submits to `POST /tasks` as one-time

**UpcomingTaskList** — Main task list view:
- Fetches from `GET /tasks?from=<today>&to=<today+14d>` (or configurable range)
- Groups by date
- Each task row shows: title, time (if timed), category color chip, modality icon, assignedTo badge
- **Derived overdue indicator:** `status=planned AND taskDate < today` → show in red/warning
- Action buttons per task:
  - Complete → `PATCH /tasks/:id` with `{ status: 'completed' }`
  - Skip → `PATCH /tasks/:id` with `{ status: 'skipped' }`
  - Cancel → `PATCH /tasks/:id` with `{ status: 'canceled' }`
  - Delete → `DELETE /tasks/:id` (soft-deletes one-time, cancels recurring)
- Filter controls: assignedTo dropdown, status filter

**TasksHomePage** — Wire it together:
- Replace the placeholder with the task list and a "create task" FAB/button
- Task form can be a dialog or a separate route (`/tasks/new`)

### i18n additions

Add `tasksPage` block to `src/app/i18n/en.ts` with form labels, button text, status labels, error messages.

### Acceptance criteria

- Can create a one-time task via the form
- Can create a recurring series via the form (with simple frequency controls)
- Upcoming list shows both one-time and generated occurrences sorted by date
- Can complete, skip, or cancel a task from the list
- Form validates required fields client-side before submission

---

## PR 3B — Homepage Card + Calendar + Visual Polish

**Goal:** Surface tasks through DASH's command-center experience with rich visual indicators.

### Components to build

**TodayTasksCard** — Homepage integration:
- Card component for the landing page or `/home`
- Shows today's tasks (`GET /tasks?from=<today>&to=<today>`)
- Shows upcoming count or next 3 upcoming tasks
- "View all" links to `/tasks`

**CalendarView** — Calendar projection:
- Consider `@mui/x-date-pickers` `DateCalendar` with custom day rendering (dot indicators for days with tasks), or a third-party calendar like `@fullcalendar/react`
- Query `GET /tasks?from=<month-start>&to=<month-end>` when month changes
- Day click shows that day's tasks
- Color-coded dots per category

**Category color system:**
- Map `color_key` to MUI palette tokens: `theme.palette[colorKey].main`
- Use in chips, dots, borders, or backgrounds
- The `default` color_key (for "Other" category) maps to `theme.palette.grey[500]`

**Modality icons:**
- physical → location/place icon
- virtual → videocam/computer icon
- none → no icon

**Kind visual treatment:**
- event → standard display
- deadline → accent/urgency indicator
- activity → softer/routine indicator

### Where to integrate

- Homepage (`src/app/home-page/HomePage.tsx`) — add TodayTasksCard
- OR landing page (`/` route, currently WordOfTheDay) — add alongside/below the word
- Tasks page — add CalendarView above or alongside the UpcomingTaskList

### Acceptance criteria

- Today's tasks visible from homepage without navigating to /tasks
- Calendar shows which days have tasks via visual indicators
- Category colors match seed data color_keys using MUI palette
- Modality icons distinguish physical/virtual/none

---

## PR 3C — Documentation + Cypress Tests + UI Tweaks

**Goal:** Ship quality. Comprehensive integration tests, user documentation, and polish.

### Cypress integration tests

Create under `cypress/e2e/tasks/`:

**Task CRUD flow:**
- Create a one-time task via the form → verify it appears in the list
- Edit a task field → verify the change persists
- Complete a task → verify status indicator updates
- Skip a task → verify it can be un-skipped (back to planned)
- Cancel a task → verify it shows as canceled
- Delete a one-time task → verify it disappears

**Series flow:**
- Create a recurring series via the form → verify multiple occurrences appear
- Cancel one occurrence → verify it doesn't reappear
- Pause a series → verify no new occurrences generate
- Resume a series → verify generation resumes

**Homepage integration:**
- Verify today's tasks appear on the homepage card
- Verify "view all" navigates to /tasks

**Calendar:**
- Verify calendar shows task indicators
- Verify month navigation fetches new data
- Verify day click reveals tasks

**Edge cases:**
- Create a timed task without startTime → verify client-side validation
- Verify overdue tasks show the derived indicator
- Verify filter controls (assignedTo, status) work

### UI tweaks and polish

- Loading skeletons (MUI `Skeleton`) during data fetches
- Error states with retry affordance
- Empty states ("No tasks for this period")
- Responsive layout for mobile
- Confirm dialog for destructive actions (cancel/delete)
- Snackbar feedback after create/complete/cancel actions
- Keyboard accessibility audit

### User documentation

- Update `docs/features/todo.md` with UI implementation notes
- Or create a brief user guide if needed

### Acceptance criteria

- All Cypress tests pass in CI
- No console errors during normal usage
- Responsive on mobile viewport
- Accessible (keyboard navigation, ARIA labels on action buttons)

---

## Quick reference: file inventory

### Backend (complete, do not modify unless fixing bugs)

| File | Purpose |
|------|---------|
| `db/migrations/20260727200000_create_task_tables.js` | Migration (3 tables + constraints + seed) |
| `src/server/utils/types.ts` | All task/series/category types |
| `src/server/utils/consts.ts` | Enums, error constants, transition maps |
| `src/server/utils/rruleHelper.ts` | RRULE validation and expansion |
| `src/server/utils/db-operation-helpers.ts` | All DB operations (task, category, series, materialization) |
| `src/server/services/taskService.ts` | Task + category business logic |
| `src/server/services/seriesService.ts` | Series CRUD + materialization engine |
| `src/server/controllers/taskController.ts` | Task + category HTTP handlers |
| `src/server/controllers/seriesController.ts` | Series HTTP handlers |
| `src/server/routes/taskRoutes.ts` | All route registrations |

### Tests (237 total)

| File | Count | Coverage |
|------|-------|----------|
| `src/__tests__/task-service.test.ts` | 52 | Task + category validation and services |
| `src/__tests__/task-controller.test.ts` | 23 | Task + category HTTP endpoints |
| `src/__tests__/series-service.test.ts` | 56 | Series validation, CRUD, actions, materialization |
| `src/__tests__/series-controller.test.ts` | 19 | Series HTTP endpoints |
| `src/__tests__/rrule-helper.test.ts` | 17 | RRULE validation and expansion |
| Other existing test files | 70 | Budget, daily word, utils |

### Frontend (to be built)

| File | PR |
|------|----|
| `src/app/tasks-page/TasksHomePage.tsx` | 3A (replace placeholder) |
| `src/app/tasks-page/components/TaskForm.tsx` | 3A |
| `src/app/tasks-page/components/UpcomingTaskList.tsx` | 3A |
| `src/app/tasks-page/components/TaskRow.tsx` | 3A |
| `src/app/tasks-page/components/CalendarView.tsx` | 3B |
| `src/app/tasks-page/components/TodayTasksCard.tsx` | 3B |
| `src/app/tasks-page/utils/taskApi.ts` | 3A |
| `src/app/i18n/en.ts` | 3A (add tasksPage block) |
| `cypress/e2e/tasks/*.cy.ts` | 3C |
