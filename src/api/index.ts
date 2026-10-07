import type { SpotifyCurrentlyPlayingResponse, SpotifyToken } from "../bot/twitch/types"

const maxRetries = 2

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
      console.error(`Spotify token refresh failed: ${res.status}`)
      return { token: null, status: res.status }
    }

    const newToken: SpotifyToken = await res.json()

    if (!newToken.refresh_token) {
        // if there is no refresh token in the response, use the old refresh token
        newToken.refresh_token = token.refresh_token 
    }
    await Bun.write(`./data/spotify.${id}.json`, JSON.stringify(newToken, null, 2)).catch((err) => {
      console.error('Failed to save token', err.message)
    })

    return { token: newToken, status: res.status }
  } catch (e) {
    console.error('Error', e)
    return { token: null, status: 500 }
  }
}

export const apiRoutes = {
  // GET /api/spotify/now-playing
  async getNowPlaying(req: Request, attempt: number = 0): Promise<{
    data: SpotifyCurrentlyPlayingResponse | null,
    status: number
  }> {
    const token: SpotifyToken = await Bun.file(`./data/spotify.${Bun.env.TWITCH_OWNER_ID}.json`).json()

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

      const data: SpotifyCurrentlyPlayingResponse  = await response.json()
      return { data, status: response.status }
    }

    if (response.status === 401 && attempt < maxRetries) {
      console.warn(
        `Spotify 401 on attempt ${attempt + 1}/${maxRetries} — refreshing token and retrying...`,
      )

      const refreshed = await refreshSpotifyToken(Bun.env.TWITCH_OWNER_ID ?? '89181064')

      if (refreshed.status === 500) {
        return {data: null, status: 500}
      }

      return this.getNowPlaying(req, attempt + 1)
    }

    if (attempt >= maxRetries) {
      console.error(`Spotify fetch failed after ${maxRetries} retries.`)
    }

    return {
      data: null,
      status: response.status
    }
  },
}
