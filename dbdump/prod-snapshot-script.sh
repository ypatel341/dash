#!/bin/bash

# Get the current date in MMDDYYYY format
CURRENT_DATE=$(date +"%m%d%Y")
# Set the Heroku app name and the path to save the dump
HEROKU_APP_NAME="dash-production-app"
DUMP_PATH="./dbdump/prod-snapshot-$CURRENT_DATE.dump"

# Capture a new backup
echo "Capturing a new backup for Heroku app: $HEROKU_APP_NAME"
heroku pg:backups:capture --app $HEROKU_APP_NAME

# Get the latest backup URL
echo "Getting the latest backup URL"
BACKUP_URL=$(heroku pg:backups:url --app $HEROKU_APP_NAME)

# Download the backup
echo "Downloading the backup to $DUMP_PATH"
curl -o $DUMP_PATH $BACKUP_URL

echo "Backup downloaded successfully to $DUMP_PATH"