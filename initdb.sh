#!/usr/bin/env sh

if [ -f .env.development.local ]; then
    echo '.env.development.local file found'
    export $(grep -v '^#' .env.development.local | xargs)
elif [ -f .env ]; then
    echo '.env file found'
    export $(grep -v '^#' .env | xargs)
fi

DB_PATH="data/sqlite.db"
SCHEMA_PATH="data/db_schema.sql"
TABLE_NAME="token"

execute_transaction() {
    sqlite3 "$DB_PATH" <<EOF
BEGIN TRANSACTION;
$1
COMMIT;
EOF
}

# Check if database file exists
if [ ! -f "$DB_PATH" ]; then
    echo "Datbase file not found, initializing..."
    sqlite3 $DB_PATH < "$SCHEMA_PATH"
    echo "Database initialized"
fi

echo "Attempting to insert records..."
# try to add tokens to table
SQL_COMMANDS="
INSERT OR IGNORE INTO $TABLE_NAME (id, access_token, refresh_token) VALUES ($TWITCH_ID, '$TWITCH_ACCESS_TOKEN', '$TWITCH_REFRESH_TOKEN');
INSERT OR IGNORE INTO $TABLE_NAME (id, access_token, refresh_token) VALUES ($BOT_ID, '$BOT_ACCESS_TOKEN', '$BOT_REFRESH_TOKEN');
"
execute_transaction "$SQL_COMMANDS"
echo "Database seeding complete."