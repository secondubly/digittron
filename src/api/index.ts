const maxRetries = 2

const refreshSpotifyToken = async (id: string) => {
  const tokenPath = `./data/spotify.${id}.json`

  try {
    const token = await Bun.file(tokenPath).json()

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
      return Response.json({})
    }

    const newToken = await res.json()

    await Bun.write(`./data/spotify.${id}.json`, JSON.stringify(newToken, null, 2)).catch((err) => {
      console.error('Failed to save token', err.message)
    })

    return Response.json(newToken)
  } catch (e) {
    console.error('Error', e)
  }
}

export const apiRoutes = {
  // GET /api/spotify/now-playing
  async getNowPlaying(req: Request, attempt: number = 0): Promise<Response> {
    const token = await Bun.file(`./data/spotify.${Bun.env.TWITCH_OWNER_ID}.json`).json()
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
        return Response.json({ data: null, status: 204, ok: true })
      }

      const data = await response.json()
      console.log('response ok data: ', data)
      return Response.json({ data, status: response.status, ok: true })
    }

    if (response.status === 401 && attempt < maxRetries) {
      console.warn(
        `Spotify 401 on attempt ${attempt + 1}/${maxRetries} — refreshing token and retrying...`,
      )

      const refreshed = await refreshSpotifyToken(Bun.env.TWITCH_OWNER_ID ?? '89181064')

      if (!refreshed) {
        return {
          data: null,
          status: 401,
          ok: false,
          error: 'Token refresh failed — re-auth required',
        }
      }

      return this.getNowPlaying(req, attempt + 1)
    }

    if (attempt >= maxRetries) {
      console.error(`Spotify fetch failed after ${maxRetries} retries.`)
    }

    return Response.json({
      data: null,
      status: response.status,
      ok: false,
      error: `Spotify API error: ${response.status}`,
    })
  },
}
