// TODO: move to a core service instead
import { db } from '@core/db'

db.run(`
    CREATE TABLE IF NOT EXISTS quotes (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        text             TEXT NOT NULL CHECK (length(trim(text)) BETWEEN 1 AND 500),
        author           TEXT,                
        author_user_id   TEXT,                
        game             TEXT,                
        added_by_user_id TEXT NOT NULL,
        added_by_name    TEXT NOT NULL,
        created_at       INTEGER NOT NULL,    -- ms since epoch
        deleted_at       INTEGER              
    )
`)
db.run('CREATE INDEX IF NOT EXISTS idx_quotes_author ON quotes (author COLLATE NOCASE)')

export interface Quote {
    id: number
    text: string
    author: string | null
    game: string | null
    addedByName: string
    createdAt: number
}

const COLUMNS = 'id, text, author, game, added_by_name AS addedByName, created_at AS createdAt'

export interface NewQuote {
    text: string
    author?: string
    authorUserId?: string
    game?: string
    addedByUserId: string
    addedByName: string
}

export function addQuote(q: NewQuote): number {
    const result = db
        .query(
            `INSERT INTO quotes (text, author, author_user_id, game, added_by_user_id, added_by_name, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
            q.text.trim(),
            q.author ?? null,
            q.authorUserId ?? null,
            q.game ?? null,
            q.addedByUserId,
            q.addedByName,
            Date.now(),
        )
    return Number(result.lastInsertRowid)
}

export function getQuote(id: number): Quote | null {
    return db.query(`SELECT ${COLUMNS} FROM quotes WHERE id = ? AND deleted_at IS NULL`).get(id) as Quote | null
}

export function randomQuote(): Quote | null {
    return db
        .query(`SELECT ${COLUMNS} FROM quotes WHERE deleted_at IS NULL ORDER BY RANDOM() LIMIT 1`)
        .get() as Quote | null
}

/** A random quote whose text or author contains `term`. */
export function searchQuote(term: string): Quote | null {
    const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%` // match % and _ literally
    return db
        .query(
            `SELECT ${COLUMNS} FROM quotes
             WHERE deleted_at IS NULL AND (text LIKE ? ESCAPE '\\' OR author LIKE ? ESCAPE '\\')
             ORDER BY RANDOM() LIMIT 1`,
        )
        .get(pattern, pattern) as Quote | null
}

/** Soft delete: the row stays, but the quote disappears and its number is never reused. */
export function deleteQuote(id: number): boolean {
    const result = db
        .query('UPDATE quotes SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL')
        .run(Date.now(), id)
    return result.changes > 0
}

export function quoteCount(): number {
    const row = db.query('SELECT COUNT(*) AS n FROM quotes WHERE deleted_at IS NULL').get() as { n: number }
    return row.n
}

/** e.g. `#12: "Never trust a shortcut" - Streamer, Elden Ring (2026-10-07)` */
export function formatQuote(q: Quote): string {
    const date = new Date(q.createdAt).toISOString().slice(0, 10)
    const who = q.author ? ` - ${q.author}` : ''
    const game = q.game ? `, ${q.game}` : ''
    return `#${q.id}: "${q.text}"${who}${game} (${date})`
}