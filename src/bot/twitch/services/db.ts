import { Database } from 'bun:sqlite'

export const db = new Database('./data/data.db')
db.run('PRAGMA journal_mode = WAL')

db.run(`
  CREATE TABLE IF NOT EXISTS command_usage (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    used_at     INTEGER NOT NULL,
    command     TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    user_name   TEXT NOT NULL,
    channel     TEXT NOT NULL,
    status      TEXT NOT NULL,      -- 'ok' | 'error' | 'denied'
    duration_ms INTEGER NOT NULL
  )
`)
db.run('CREATE INDEX IF NOT EXISTS idx_usage ON command_usage (command, used_at)')