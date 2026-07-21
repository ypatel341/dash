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
DUMP_PATH="./dbdump/prod-snapshot-$CURRENT_DATE.dump"

echo "Capturing a new backup to $DUMP_PATH"
pg_dump \
  --format=custom \
  --no-owner \
  --no-acl \
  --file "$DUMP_PATH" \
  "$RAILWAY_DATABASE_PUBLIC_URL"

echo "Backup captured successfully to $DUMP_PATH"
