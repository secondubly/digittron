import { db } from '@core/db'
import type { SpotifyCurrentlyPlayingResponse, SpotifyToken } from '../bot/twitch/types'
import { log } from '@core/logger'
import type { Quote } from './types'

const maxRetries = 2

const COLUMNS = 'id, text, author, game, added_by_name AS addedByName, created_at AS createdAt'

const refreshSpotifyToken = async (id: string) => {
  const tokenPath = `./data/spotify.${id}.json`

  try {
    // get existing token
    const token: SpotifyToken = await Bun.file(tokenPath).json()

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${Bun.env.SPOTIFY_CLIENT_ID}:${Bun.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
      }),
    })

    if (!res.ok) {
      log.api.error({ res }, 'Spotify token refresh failed')
      return { token: null, status: res.status }
    }

    const newToken: SpotifyToken = await res.json()

    if (!newToken.refresh_token) {
      // if there is no refresh token in the response, use the old refresh token
      newToken.refresh_token = token.refresh_token
    }
    await Bun.write(`./data/spotify.${id}.json`, JSON.stringify(newToken, null, 2)).catch((err) => {
      log.api.error({ err }, 'Failed to save updated token')
    })

    log.api.info({ user: id }, 'Token refresh successful')
    return { token: newToken, status: res.status }
  } catch (err) {
    log.api.error({ err }, 'Unexpected error')
    return { token: null, status: 500 }
  }
}

export const apiRoutes = {
  // GET /api/spotify/now-playing
  async getNowPlaying(
    req: Request,
    attempt: number = 0,
  ): Promise<{
    data: SpotifyCurrentlyPlayingResponse | null
    status: number
  }> {
    const token: SpotifyToken = await Bun.file(
      `./data/spotify.${Bun.env.TWITCH_OWNER_ID}.json`,
    ).json()

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      // 204 No Content — return null data (e.g. nothing playing on Spotify)
      if (response.status === 204) {
        return { data: null, status: 204 }
      }

      const data: SpotifyCurrentlyPlayingResponse = await response.json()
      return { data, status: response.status }
    }

    if (response.status === 401 && attempt < maxRetries) {
      log.api.warn(
        `Spotify 401 on attempt ${attempt + 1}/${maxRetries} — refreshing token and retrying...`,
      )

      const refreshed = await refreshSpotifyToken(Bun.env.TWITCH_OWNER_ID ?? '89181064')

      if (refreshed.status === 500) {
        return { data: null, status: 500 }
      }

      return this.getNowPlaying(req, attempt + 1)
    }

    if (attempt >= maxRetries) {
      log.api.error(`Spotify fetch failed after ${maxRetries} retries.`)
    }

    return {
      data: null,
      status: response.status,
    }
  },

  // TODO: POST /api/quotes

  // GET /api/quotes/random
  getRandomQuote() {
    const quote = db.query(`SELECT ${COLUMNS} FROM quotes WHERE deleted_at IS NULL ORDER BY RANDOM() LIMIT 1`).get() as Quote | null
    return Response.json(quote)
  },

  // GET /api/quotes/:id
  getQuoteById(req: Request, idStr: string | undefined) {
    const id = Number(idStr)
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: 'Invalid id' }, { status: 400 })
    
    const quote = db.query(`SELECT ${COLUMNS} FROM quotes WHERE id = ? AND deleted_at IS NULL`).get(id) as Quote | null

    if (quote) {
      return Response.json(quote)
    } else {
      return Response.json({ error: 'Quote not found' }, { status: 404 })
    }
  },

  
  // GET /api/quotes?q=term
  searchQuote(req: Request) {
    const url = new URL(req.url)

    const term = url.searchParams.get('q')

    if (!term) {
      return Response.json({ error: 'Missing search term'}, { status: 400 })
    }

    const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%` // match % and _ literally
    const quote = db
            .query(
                `SELECT ${COLUMNS} FROM quotes
                 WHERE deleted_at IS NULL AND (text LIKE ? ESCAPE '\\' OR author LIKE ? ESCAPE '\\')
                 ORDER BY RANDOM() LIMIT 1`,
            )
            .get(pattern, pattern) as Quote | null

    if (quote) {
      return Response.json(quote)
    } else {
      return Response.json({ error: 'Could not find a quote with that term.'}, { status: 404 })
    }
  },

  // DELETE /api/quotes/:id
  deleteQuote(req: Request, idStr: string | undefined) {
    const id = Number(idStr)

    if (!Number.isInteger(id) || id < 1) {
      return Response.json({ error: 'Invalid id'}, { status: 400 })
    }

    /** Soft delete: the row stays, but the quote disappears and its number is never reused. */
    const result = db
      .query('UPDATE quotes SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL')
      .run(Date.now(), id)

    if (result.changes > 0) {
      return Response.json({}, { status: 204 })
    } else {
      // TODO: handle other cases
      return Response.json({ error: 'Quote not found.'}, { status: 404 })
    }
  }
}
