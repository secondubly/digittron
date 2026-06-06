import { Value } from '@sinclair/typebox/value'
import { currentlyPlayingSchema } from 'src/server/schemas/spotify'

const BASE_URL = 'http://localhost:4000'

const getAccessToken = async (): Promise<string | null> => {
    const twitchId = process.env.TWITCH_ID
    const url = new URL(`api/spotify/token/${twitchId}`, BASE_URL).toString()

    const response = await fetch(url, {
        method: 'GET',
    })

    if (!response.ok && response.status === 404) {
        throw Error('Something went wrong')
    }

    const accessToken = await response.text()

    return accessToken
}

const callWithTokenRevalidation =
    <T, P extends unknown[]>(
        f: (token: string, ...rest: P) => Promise<T | number>,
        revalidateCall: boolean = false,
    ) =>
    async (...params: P): Promise<T | number> => {
        const token = await getAccessToken()
        if (!token) {
            return 404
        }

        const status = await f(token, ...params)

        if (typeof status === 'number') {
            if (status === 401) {
                if (!revalidateCall) {
                    return callWithTokenRevalidation(f, true)(...params)
                }
            }
        }

        return status
    }

const fetchCurrentlyPlaying = async (accessToken: string) => {
    const playingOptions = {
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    }

    const response = await fetch(playingOptions.url, {
        method: 'GET',
        headers: playingOptions.headers,
    })

    if (response.status !== 200) {
        return response.status
    }

    let playingData = null
    const data = await response.json()
    playingData = Value.Parse(currentlyPlayingSchema, data)

    return playingData
}

export const getCurrentlyPlayingTrack = callWithTokenRevalidation(
    fetchCurrentlyPlaying,
)
