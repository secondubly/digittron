export $(grep -v '^#' .env | xargs)
DB_PATH="./db/sqlite.db"

if [ ! $DB_PATH ]; then
    echo "database file not found, creating..."
    sqlite3 "$DB_FILE" "VACUUM;"
else
    echo "Database file found!"
fi
