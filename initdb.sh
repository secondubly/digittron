#!/usr/bin/env sh

DB_PATH="/usr/src/app/db/sqlite.db"

# Check if the file does not exist
if [ ! -f "$DB_PATH" ]; then
    echo "Database file not found. Creating a new one at $DB_PATH"
    sqlite3 "$DB_PATH" "VACUUM;"
else
    echo "Database file found at $DB_PATH"
fi
