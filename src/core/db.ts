import { Database } from 'bun:sqlite'
import { log } from '@core/logger'
import { onShutdown } from '@core/shutdown'

if (!Bun.env.DATABASE_PATH) {
  throw new Error('Missing database path.')
}
export const db = new Database(Bun.env.DATABASE_PATH)

// REVIEW: do we need this?
db.run('PRAGMA journal_mode = WAL')

// command usage tracker
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

// d20 rolls tracker
db.run(`
  CREATE TABLE IF NOT EXISTS d20_rolls (
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


// first rewards tracker
db.run(`
    CREATE TABLE IF NOT EXISTS first_redemptions (
        id                TEXT PRIMARY KEY,   -- Twitch's redemption id
        stream_id         TEXT,               -- which stream it was claimed in (NULL if we couldn't tell)
        stream_started_at INTEGER,            -- ms since epoch, for showing the stream's date
        user_id           TEXT NOT NULL,
        user_name         TEXT NOT NULL,      -- login name
        display_name      TEXT NOT NULL,
        status            TEXT NOT NULL,      -- unfulfilled | fulfilled | canceled | unknown
        redeemed_at       INTEGER NOT NULL,   -- ms since epoch
        updated_at        INTEGER NOT NULL    -- ms since epoch, last status change
    )
`)
db.run('CREATE INDEX IF NOT EXISTS idx_firsts_user ON first_redemptions (user_id, status)')
db.run('CREATE INDEX IF NOT EXISTS idx_firsts_stream ON first_redemptions (stream_id)')

onShutdown('close-db', async () => {
  log.app.info('Database closing')
  db.close()
  log.app.info('Database closed')
})
