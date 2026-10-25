// src/web/static.ts - serves the files `vite build` produced (dist/web).
import { join, sep } from 'node:path'

// Relative to the working directory, like ./data and the token files. Run the server from the project root.
const WEB_DIR = join(process.cwd(), 'dist', 'web')

const PAGES: Record<string, string> = {
    '/': 'index.html',
    '/leaderboard': 'leaderboard.html',
}

/** Returns the file's response, or null so the caller can carry on to its 404. */
export async function serveStatic(pathname: string): Promise<Response | null> {
    let rel: string
    try {
        rel = (PAGES[pathname] ?? decodeURIComponent(pathname)).replace(/^\/+/, '')
    } catch {
        return null // malformed %-encoding
    }

    const path = join(WEB_DIR, rel)
    if (!path.startsWith(WEB_DIR + sep)) return null // never serve anything outside dist/web

    const file = Bun.file(path)
    if (!(await file.exists())) return null

    const cache = rel.startsWith('assets/') ? 'public, max-age=31536000, immutable' : 'no-cache'
    return new Response(file, { headers: { 'Cache-Control': cache } })
}