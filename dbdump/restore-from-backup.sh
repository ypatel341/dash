#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./dbdump/restore-from-backup.sh                              # restores the latest .dump file
#   ./dbdump/restore-from-backup.sh ./dbdump/prod-snapshot.dump   # restores a specific file

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DB_NAME="dash-test"
DB_USER="postgres"
DB_PASS="postgres"
DB_HOST="localhost"
DB_PORT="5432"

ENV_FILE="$PROJECT_ROOT/.env.development"
if [[ -f "$ENV_FILE" ]]; then
  DB_URL=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d'=' -f2-)
  if [[ -n "${DB_URL:-}" ]]; then
    DB_NAME=$(echo "$DB_URL" | sed -E 's|.*/(.[^?]*).*|\1|')
    DB_USER=$(echo "$DB_URL" | sed -E 's|.*://([^:]+):.*|\1|')
    DB_PASS=$(echo "$DB_URL" | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|')
    DB_HOST=$(echo "$DB_URL" | sed -E 's|.*@([^:]+):.*|\1|')
    DB_PORT=$(echo "$DB_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
  fi
fi

export PGPASSWORD="$DB_PASS"

if [[ -n "${1:-}" ]]; then
  DUMP_FILE="$1"
else
  DUMP_FILE=$(ls -t "$SCRIPT_DIR"/prod-snapshot-*.dump 2>/dev/null | head -1)
  if [[ -z "$DUMP_FILE" ]]; then
    echo "No .dump files found in $SCRIPT_DIR"
    exit 1
  fi
  echo "No file specified — using latest: $DUMP_FILE"
fi

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Dump file not found: $DUMP_FILE"
  exit 1
fi

FILE_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "Restoring $DUMP_FILE ($FILE_SIZE) into $DB_NAME on $DB_HOST:$DB_PORT"

DB_EXISTS=$(psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || true)

if [[ "$DB_EXISTS" = "1" ]]; then
  echo "Terminating active connections to $DB_NAME..."
  psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -tAc \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
  echo "Dropping existing database $DB_NAME..."
  dropdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME"
fi

echo "Creating database $DB_NAME..."
createdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME"

PG_RESTORE="/usr/lib/postgresql/18/bin/pg_restore"
if [[ ! -x "$PG_RESTORE" ]]; then
  PG_RESTORE="pg_restore"
fi

echo "Restoring..."
"$PG_RESTORE" \
  -U "$DB_USER" \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -d "$DB_NAME" \
  --no-owner \
  --no-acl \
  "$DUMP_FILE"

echo "Database $DB_NAME restored successfully."
