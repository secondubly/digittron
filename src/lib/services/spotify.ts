import type { TokenStore } from '@lib/core/tokens/TokenStore'
import { Value } from '@sinclair/typebox/value'
import { config } from 'src/config/env'
import { currentlyPlayingSchema } from 'src/server/schemas/spotify'
import { log } from './logger'
import type { TokenRecord } from '@lib/core/tokens/types'

// TODO: rewrite all this functionality
const getAccessToken = async (
    tokenStore: TokenStore,
): Promise<string | null> => {
    // TODO: use token store to fetch access token instead of hitting the API
    const token = await tokenStore.get(
        `spotify:${config.TWITCH_BROADCASTER_ID}`,
    )

    if (!token) {
        log.app.warn(
            `No spotify token found for ${config.TWITCH_BROADCASTER_ID}`,
        )
    }
    return (token as TokenRecord).accessToken
}

const callWithTokenRevalidation =
    <T, P extends unknown[]>(
        f: (
            token: string,
            tokenStore: TokenStore,
            ...rest: P
        ) => Promise<T | number>,
        revalidateCall: boolean = false,
    ) =>
    (tokenStore: TokenStore) =>
    async (...params: P): Promise<T | number> => {
        const token = await getAccessToken(tokenStore)

        if (!token) return 404

        const status = await f(token, tokenStore, ...params)

        if (typeof status === 'number' && status === 401 && !revalidateCall) {
            return callWithTokenRevalidation(f, true)(tokenStore)(...params)
        }

        return status
    }

const fetchCurrentlyPlaying = async (
    accessToken: string,
    _tokenStore: TokenStore,
) => {
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

export const getCurrentlyPlayingTrack = (tokenStore: TokenStore) =>
    callWithTokenRevalidation(fetchCurrentlyPlaying)(tokenStore)
