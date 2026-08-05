#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   export RAILWAY_DATABASE_PUBLIC_URL='postgresql://postgres:<password>@<proxy>.proxy.rlwy.net:<port>/railway'
#   ./dbdump/prod-snapshot-script.sh

if [[ -z "${RAILWAY_DATABASE_PUBLIC_URL:-}" ]]; then
  echo "Missing RAILWAY_DATABASE_PUBLIC_URL env var."
  echo "Example:"
  echo "  export RAILWAY_DATABASE_PUBLIC_URL='postgresql://postgres:<password>@<proxy>.proxy.rlwy.net:<port>/railway'"
  exit 1
fi

CURRENT_DATE=$(date +"%m%d%Y")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DUMP_PATH="$SCRIPT_DIR/prod-snapshot-$CURRENT_DATE.dump"

echo "Capturing a new backup to $DUMP_PATH"
PG_DUMP="/usr/lib/postgresql/18/bin/pg_dump"
if [[ ! -x "$PG_DUMP" ]]; then
  PG_DUMP="pg_dump"
fi

"$PG_DUMP" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file "$DUMP_PATH" \
  "$RAILWAY_DATABASE_PUBLIC_URL"

FILE_SIZE=$(du -h "$DUMP_PATH" | cut -f1)
echo "Backup captured successfully to $DUMP_PATH ($FILE_SIZE)"
