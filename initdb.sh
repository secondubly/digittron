if [ -f .env.development.local ]; then
    echo '.env.development.local file found'
    export $(grep -v '^#' .env.development.local | xargs)
elif [ -f .env ]; then
    echo '.env file found'
    export $(grep -v '^#' .env | xargs)
fi

DB_PATH="./db/sqlite.db"
SEED_FILE="./db/seed.example.sql"

if [ ! $DB_PATH ]; then
    echo "database file not found, creating..."
    sqlite3 "$DB_FILE" "VACUUM;"
else
    echo "Database file found!"
fi

