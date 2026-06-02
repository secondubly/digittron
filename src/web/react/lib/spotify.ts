import { useCallback, useEffect, useState } from 'react'
import type { QueueResponse } from '../types/spotify'

const ACCESS_TOKEN = 'YOUR_SPOTIFY_ACCESS_TOKEN'

// Fetches both the currently playing track and the queue
export const fetchPlaybackState = async (): Promise<QueueResponse> => {
    const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
        headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
    })

    if (response.status === 401) {
    }
    if (!response.ok) {
        throw new Error('Failed to fetch playback state')
    }

    // Returns an object containing: { currently_playing: {...}, queue: [...] }
    return response.json()
}

export const useSpotifyAuth = () => {
    const [token, setToken] = useState<string | null>(null)

    // try to get token
    useEffect(() => {
        getToken()
    }, [])

    // getToken also handles refreshing token if it has expired
    const getToken = useCallback(async () => {
        try {
            // TODO: set as env variable
            const twitchId = '89181064'
            const res = await fetch(`/api/spotify/token/${twitchId}`)

            const token = await res.text()
            setToken(token)
            return token
        } catch (error) {
            console.error('Failed to retrieve token', error)
        }
    }, [token])

    const fetchWithRefresh = useCallback(
        async (url: string, options: RequestInit = {}) => {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            }

            const response = await fetch(url, options)
            console.log('hello')
            if (response.status === 401) {
                const newToken = await getToken()
                if (newToken) {
                    options.headers = {
                        ...options.headers,
                        Authorization: `Bearer: ${newToken}`,
                    }

                    return fetch(url, options)
                }
            }

            return response
        },
        [token, getToken],
    )

    return { token, fetchWithRefresh }
}
