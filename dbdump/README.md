# Database Backup & Restore

## Scripts

### 1. Take a prod snapshot

Captures the Railway production database into a timestamped `.dump` file.

```bash
export RAILWAY_DATABASE_PUBLIC_URL='postgresql://postgres:<password>@<proxy>.proxy.rlwy.net:<port>/railway'
./dbdump/prod-snapshot-script.sh
```

Creates `dbdump/prod-snapshot-MMDDYYYY.dump`.

### 2. Restore locally

Restores a dump file into the local `dash-test` database. Reads connection details from `.env.development` if present, otherwise defaults to `postgres://postgres:postgres@localhost:5432/dash-test`.

```bash
# Restore the latest dump (by modification time)
./dbdump/restore-from-backup.sh

# Restore a specific dump
./dbdump/restore-from-backup.sh ./dbdump/prod-snapshot-10252025.dump
```

After restoring, run migrations and start the app:

```bash
npm run migrate:dev
npm run start-all
```

### 3. Restore to Railway prod (rare)

`restore-railway-db.sh` restores a dump file into the Railway production database. It creates a safety backup first and requires typing `RESTORE` to confirm.

```bash
export RAILWAY_DATABASE_PUBLIC_URL='postgresql://postgres:<password>@<proxy>.proxy.rlwy.net:<port>/railway'
./dbdump/restore-railway-db.sh ./dbdump/prod-snapshot-10252025.dump
```

## Knex Migrations

- The baseline schema migration is for new dev machines only — production tables were created separately
- Run `npx knex migrate:make migration_name` to create a new migration
- Run `npm run migrate:dev` to apply pending migrations locally
