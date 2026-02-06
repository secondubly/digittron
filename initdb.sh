DB_PATH="/usr/src/app/sqlite.db"

# Check if the file does not exist
if [ ! -f "$DB_PATH" ]; 
then
    echo "Database file not found. Creating a new one at $DB_PATH"
    # Create the database file by running a simple, harmless command like 'VACUUM;' or 'PRAGMA user_version = 0;'
    sqlite3 "$DB_PATH" "VACUUM;"
else
    echo "Database file found at $DB_PATH"
fi