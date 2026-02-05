#!/usr/bin/env sh

set -e

DB_PATH="db/sqlite.db"
SEED_FILE="db/seed.sql"

if [[ -z $(sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table';") ]]; then
    echo "Database is empty, seeding with initial data..."
    # Execute the seed file if tables are not found
    sqlite3 "$DB_PATH" < "$SEED_FILE"
    echo "Seeding complete."
else
    echo "Database already contains tables, skipping seeding."
fi