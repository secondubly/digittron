import type { TokenStore } from '@core/tokens/TokenStore'
import { config } from '@core/config/env'
import { log } from '@core/utils/logger'
import type { OauthTokenRecord } from '@core/tokens/types'

interface SpotifyFetcherOptions {
  tokenStore: TokenStore
  twitchId: string
  maxRetries?: number
}

interface SpotifyResponse<T> {
  data: T | null
  status: number
  ok: boolean
  error?: string
}

export class SpotifyFetcher {
  private readonly tokenStore: TokenStore
  private readonly twitchId: string
  private readonly maxRetries: number

  constructor({ tokenStore, twitchId, maxRetries = 2 }: SpotifyFetcherOptions) {
    this.tokenStore = tokenStore
    this.twitchId = twitchId
    this.maxRetries = maxRetries
  }

  async fetch<T>(
    url: string,
    options: RequestInit = {},
    attempt: number = 0,
  ): Promise<SpotifyResponse<T>> {
    const token = await this.getAccessToken()

    if (!token) {
      return {
        data: null,
        status: 401,
        ok: false,
        error: `No Spotify token found for ${this.twitchId}`,
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      // 204 No Content — return null data (e.g. nothing playing on Spotify)
      if (response.status === 204) {
        return { data: null, status: 204, ok: true }
      }

      const data = (await response.json()) as T
      return { data, status: response.status, ok: true }
    }

    if (response.status === 401 && attempt < this.maxRetries) {
      log.api.warn(
        `Spotify 401 on attempt ${attempt + 1}/${this.maxRetries} — refreshing token and retrying...`,
      )

      const refreshed = await this.refreshToken()

      if (!refreshed) {
        return {
          data: null,
          status: 401,
          ok: false,
          error: 'Token refresh failed — re-auth required',
        }
      }

      return this.fetch<T>(url, options, attempt + 1)
    }

    // ── Max retries reached or non-401 error ──────────────────────────────────
    if (attempt >= this.maxRetries) {
      log.api.error(
        `Spotify fetch failed after ${this.maxRetries} retries: ${url}`,
      )
    }

    return {
      data: null,
      status: response.status,
      ok: false,
      error: `Spotify API error: ${response.status}`,
    }
  }

  async getCurrentlyPlaying<T>(): Promise<SpotifyResponse<T>> {
    return this.fetch<T>(
      'https://api.spotify.com/v1/me/player/currently-playing',
    )
  }

  async getRecentlyPlayed<T>(limit = 10): Promise<SpotifyResponse<T>> {
    return this.fetch<T>(
      `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
    )
  }

  async getPlaybackState<T>(): Promise<SpotifyResponse<T>> {
    return this.fetch<T>('https://api.spotify.com/v1/me/player')
  }

  private async getAccessToken(): Promise<string | null> {
    const token = await this.tokenStore.get(`spotify:${this.twitchId}`)
    if (!token) {
      log.api.warn(`No Spotify token found for twitchId: ${this.twitchId}`)
      return null
    }

    return (token as OauthTokenRecord).accessToken
  }

  private async refreshToken(): Promise<boolean> {
    let record = await this.tokenStore.get(`spotify:${this.twitchId}`)

    if (!record || !(record as OauthTokenRecord)?.refreshToken) {
      log.api.error(`No Spotify refresh token for ${this.twitchId}`)
      return false
    }

    record = record as OauthTokenRecord
    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`,
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: record.refreshToken,
        }),
      })

      if (!res.ok) {
        log.api.error(`Spotify token refresh failed: ${res.status}`)
        return false
      }

      const data = await res.json()

      await this.tokenStore.set(`spotify:${this.twitchId}`, {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? record.refreshToken,
        expiresIn: data.expires_in,
        obtainedAt: Date.now(),
        scope: data.scope ?? record.scope,
        userId: record.twitchId,
        provider: 'spotify',
      })

      log.api.info(`Spotify token refreshed for ${this.twitchId}`)
      return true
    } catch (err) {
      log.api.error({ err }, 'Spotify token refresh error')
      return false
    }
  }
}
