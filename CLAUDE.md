# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

DASH (Decentralized Automation System for Home) is a personal life-management monolith with three pillars: **Budget**, **Tasks**, and **Home**. It's a React + Express TypeScript app — frontend on port 3000, backend API on port 5000, backed by PostgreSQL via Knex.

## First-time setup (new machine)

1. **Create `.env.development`** in the project root — this file is not committed:
   ```
   DATABASE_URL=postgres://postgres:<your-pg-password>@localhost:5432/dash-test
   REACT_APP_API_URL=http://localhost:5000
   ```
   `DATABASE_URL` is used by both the backend (`src/config/db.ts`) and Knex migrations (`knexfile.js`). `REACT_APP_API_URL` is the backend base URL used by all frontend API calls.

2. **Restore the database** from the latest dump in `dbdump/`. The dumps come from Heroku PostgreSQL 15, so you need `postgresql-client-15` or newer — the system `pg_restore` may be too old:
   ```bash
   # Install if needed (Ubuntu — add pgdg repo first if apt can't find it)
   sudo apt-get install -y postgresql-client-15

   PGPASSWORD=<pw> createdb -U postgres -h localhost dash-test
   PGPASSWORD=<pw> /usr/lib/postgresql/15/bin/pg_restore \
     -U postgres -h localhost -d dash-test --no-owner --no-acl \
     dbdump/prod-snapshot-<latest>.dump
   ```
   The `restore-from-backup.sh` script builds the filename from today's date, so it only works if you captured a snapshot today. Use the manual command above for existing dumps.

3. **Run migrations**, then start:
   ```bash
   npm run migrate:dev
   npm run start-all
   ```

## Commands

```bash
# Full dev stack (runs migrations first, then starts both servers)
npm run start-all

# Frontend only (react-scripts dev server, port 3000)
npm start

# Backend only (compiles TS then runs node)
npm run start-backend

# Run all unit tests
npm test

# Run a single test file
npx jest src/__tests__/utils.test.ts --detectOpenHandles

# Open Cypress integration tests (requires start-all running)
npm run test:int

# Run DB migrations
npm run migrate:dev   # development
npm run migrate:prod  # production

# Production build (outputs to dist/)
npm run build

# Format
npm run prettier
```

## Architecture

### Frontend (`src/app/`)

React SPA with React Router v6. Entry at `src/index.tsx`, root component at `src/app/App.tsx`.

Routes:
- `/` — nav hub
- `/budget` — nested budget routes via `BudgetOutlet` (an `<Outlet />` wrapper)
  - `/budget/enter-expense`, `/budget/net-worth`, `/budget/money-in-month`
  - `/budget/details/:YYYYMM/:bucketname`
- `/home` — Home pillar (early stage)
- `/tasks` — Tasks pillar (early stage)

MUI is the component library. Tachyons is also available for utility classes.

### Backend (`src/server/`)

Express app in `src/server/index.ts`. Currently only the budget domain has routes, mounted at `/budget`.

Layer pattern: `routes/ → controllers/ → services/ → db-operation-helpers.ts`

- `budgetRoutes.ts` — route definitions
- `budgetController.ts` — request/response handling
- `budgetService.ts` — business logic
- `db-operation-helpers.ts` — raw Knex queries

In dev/test `NODE_ENV`, clustering is disabled (single process). In production, the server forks workers based on `HEROKU_AVAILABLE_PARALLELISM` / `WEB_CONCURRENCY`.

### Database (`src/config/db.ts`, `db/migrations/`)

Knex connects to Postgres. Dev DB: `postgres://postgres:@localhost:5432/dash-test`. Config auto-selects `.env.development` or `.env.production` based on `NODE_ENV`.

Migrations live in `db/migrations/`. Always run `migrate:dev` before starting the backend locally.

### Build

`npm run build` (webpack) compiles the frontend to `dist/`. The Express server serves `dist/` as static files, so the production setup is a single Node process serving both the API and the built frontend.

TypeScript is compiled via `tsc` for the backend (`dist/server/`) and via `ts-loader`+`babel-loader` through webpack for the frontend.

### Types

Shared server-side types live in `src/server/utils/types.ts`. The `household` field on `BudgetType` distinguishes expenses between the primary home and supporting family.

### Reporting

`src/server/utils/pdfgenerator/` uses Puppeteer + Mustache templates to render monthly budget PDFs. The `.mustache` template is styled with a standalone CSS file.

### i18n

String literals are centralized in `src/app/i18n/en.ts`. Use this for any user-facing copy.

## Commit conventions

Commitlint is configured but all rules are disabled — no enforced format. Husky runs lint-staged on commit (tests + Cypress + prettier).
