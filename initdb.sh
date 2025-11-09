#!/usr/bin/env sh

if [ -f /usr/src/app/.env ]; then
    echo '.env file found'
    export $(grep -v '^#' .env | xargs)
elif [ -f .env.development.local ]; then
    echo '.env.development.local file found'
    export $(grep -v '^#' .env.development.local | xargs)
fi

DB_FILE="sqlite.db"
TABLE_NAME="token"

sqlite3 $DB_FILE "CREATE TABLE IF NOT EXISTS $TABLE_NAME (
    id integer not null primary key autoincrement, 
    access_token text not null, 
    refresh_token text not null
);"

execute_transaction() {
    sqlite3 "$DB_FILE" <<EOF
BEGIN TRANSACTION;
$1
COMMIT;
EOF
}

# Example usage:
# Insert multiple records within a single transaction
SQL_COMMANDS="
INSERT INTO $TABLE_NAME (id, access_token, refresh_token) VALUES ($TWITCH_ID, '$TWITCH_ACCESS_TOKEN', '$TWITCH_REFRESH_TOKEN');
INSERT INTO $TABLE_NAME (id, access_token, refresh_token) VALUES ($BOT_ID, '$BOT_ACCESS_TOKEN', '$BOT_REFRESH_TOKEN');
"
execute_transaction "$SQL_COMMANDS"