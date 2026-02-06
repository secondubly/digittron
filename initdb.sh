DB_FILE="sqlite.db"

DB_DIR=$(dirname "$DB_FILE")
mkdir -p "/usr/src/app/db"

sqlite3 "$DB_FILE" ";"
