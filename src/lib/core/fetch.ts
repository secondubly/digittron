import type { SpotifyAccessToken } from './types.js'
import redisClient from '@lib/utils/redis.js'
import { log } from '@lib/utils/logger.js'

let accessToken: SpotifyAccessToken | null = null
let refreshToken: string | null = null
let isRefreshing = false
const requestQueue: (() => void)[] = [] // Queue for requests waiting for token refresh

const refreshAccessToken = async (): Promise<boolean> => {
    if (isRefreshing) {
        return new Promise<boolean>((resolve) => {
            requestQueue.push(() => resolve(refreshAccessToken()))
        })
    }

    isRefreshing = true

    try {
        if (!refreshToken) throw new Error('No refresh token available')
        if (
            !process.env.SPOTIFY_CLIENT_ID ||
            !process.env.SPOTIFY_CLIENT_SECRET
        ) {
            throw new Error('Missing required spotify environment variables')
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        })

        if (!response.ok) throw new Error('Failed to refresh token')

        const data: SpotifyAccessToken | null = await response.json()

        if (!data) {
            throw new Error('Could not refresh authorization token')
        }

        accessToken = data
        refreshToken = data.refresh_token ?? refreshToken
        // if there is no refresh token present in the request, use the existing one instead
        if (!data.refresh_token) {
            data.refresh_token = refreshToken
        }
        setTokens(data, data.refresh_token)

        // Process queued requests
        while (requestQueue.length > 0) {
            const resolve = requestQueue.shift()
            if (resolve) resolve()
        }

        return true
    } catch (error) {
        log.app.error(`Token refresh failed: ${error}`)
        // Redirect to login page or handle logout
        // Example: window.location.href = '/login'; (if in a browser context, adjust for Node.js)
        return false
    } finally {
        isRefreshing = false
    }
}

const setTokens = async (
    newToken: SpotifyAccessToken,
    newRefreshToken: string,
) => {
    redisClient.set(
        `spotify_${process.env.TWITCH_ID}`,
        JSON.stringify(newToken),
    )

    accessToken = newToken
    refreshToken = newRefreshToken

    // send post request to API to update db with new token
    const twitchId = process.env.TWITCH_ID || '89181064'
    const url = `http://localhost:4000/api/spotify-token`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: twitchId, access_token: newToken }),
    })

    if (!response.ok) {
        log.bot.error(response.statusText)
    }

    return
}

const getSpotifyToken = async (): Promise<SpotifyAccessToken | null> => {
    const twitchId = process.env.TWITCH_ID || '89181064'
    const spotifyAccessToken = await redisClient.get(`spotify_${twitchId}`)

    if (!spotifyAccessToken) {
        const url = `http://localhost:4000/api/spotify-token/${twitchId}`
        const response = await fetch(url)

        if (!response.ok) {
            log.bot.error(response)
            throw Error(`Spotify access token not found in cache or database`)
        }

        const data = await response.json()
        if (!data) {
            return null
        }

        return data as SpotifyAccessToken
    } else {
        return JSON.parse(spotifyAccessToken) as SpotifyAccessToken
    }
}

export const authFetch = async (
    url: string,
    options: RequestInit = {},
): Promise<Response> => {
    if (url.includes('spotify')) {
        // get spotify access token
        accessToken = await getSpotifyToken()
    }

    if (!accessToken) {
        throw new Error('Could not retrieve authorization token')
    }

    if (accessToken && options.headers) {
        ;(options.headers as Record<string, string>)['Authorization'] =
            `Bearer ${accessToken.access_token}`
    }

    refreshToken = accessToken.refresh_token || null
    let response = await fetch(url, options)

    if (response.status === 401 && accessToken?.refresh_token) {
        log.app.info('Access token expired, attempting to refresh...')

        const refreshed = await refreshAccessToken()

        if (refreshed) {
            // Retry the original request with the new token
            if (options.headers) {
                ;(options.headers as Record<string, string>)['Authorization'] =
                    `Bearer ${accessToken.access_token}`
            }
            response = await fetch(url, options)
        } else {
            // Refresh failed, original 401 should be handled by the caller or force logout
            return response
        }
    }

    return response
}
