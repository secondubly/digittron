import { Database } from 'bun:sqlite'
import { log } from '@core/logger'
import { onShutdown } from '@core/shutdown'

if (!Bun.env.DATABASE_PATH) {
  throw new Error('Missing database path.')
}
export const db = new Database(Bun.env.DATABASE_PATH)

db.run('PRAGMA journal_mode = WAL')

db.run(`
  CREATE TABLE IF NOT EXISTS command_usage (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    used_at     INTEGER NOT NULL,
    command     TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    user_name   TEXT NOT NULL,
    channel_id  TEXT NOT NULL,
    status      TEXT NOT NULL,      -- 'ok' | 'error' | 'denied'
    duration_ms INTEGER NOT NULL
  )
`)
db.run('CREATE INDEX IF NOT EXISTS idx_usage ON command_usage (command, used_at)')

// for tracking d20 rolls
db.run(`
  CREATE TABLE d20_rolls (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT NOT NULL,
      user_id    TEXT NOT NULL,
      username   TEXT NOT NULL,
      roll       INTEGER NOT NULL CHECK (roll BETWEEN 1 AND 20),
      is_nat_20  INTEGER GENERATED ALWAYS AS (CASE WHEN roll = 20 THEN 1 ELSE 0 END) STORED,
      is_nat_1   INTEGER GENERATED ALWAYS AS (CASE WHEN roll = 1 THEN 1 ELSE 0 END) STORED,
      rolled_at  INTEGER NOT NULL
  );
`)

db.run(`
  CREATE INDEX IF NOT EXISTS idx_d20_rolls_lookup ON d20_rolls(channel_id, user_id);
  CREATE INDEX IF NOT EXISTS idx_d20_crit_20s ON d20_rolls(user_id) WHERE is_nat_20 = TRUE;
  CREATE INDEX IF NOT EXISTS idx_d20_crit_1s ON d20_rolls(user_id) WHERE is_nat_1 = TRUE;  
`)

onShutdown('close-db', async () => {
  log.app.info('Database closing')
  db.close()
  log.app.info('Database closed')
})
