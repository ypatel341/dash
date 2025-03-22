#!/bin/bash

# Set the database name and the path to the dump file
DB_NAME="dash-test"
DUMP_FILE="./dbdump/prod-snapshot-$(date +"%m%d%Y").dump"

# Check if the database exists
DB_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
  echo "Database $DB_NAME exists. Dropping the database..."
  dropdb -U postgres $DB_NAME
else
  echo "Database $DB_NAME does not exist."
fi

# Create a new database
echo "Creating a new database $DB_NAME..."
createdb -U postgres $DB_NAME

# Restore the dump into the new database
echo "Restoring the dump into the database $DB_NAME..."
pg_restore -U postgres -d $DB_NAME $DUMP_FILE

echo "Database $DB_NAME restored successfully from $DUMP_FILE"