import type { AccessToken } from '@twurple/auth'
import type { TwitchTokenApiResponse } from '../bot/types.js'
import type { AccessToken as SpotifyAccessToken } from '@spotify/web-api-ts-sdk'
import redisClient from './redis.js'
import { log } from './logger.js'

const BOT_SCOPES = [
    'channel:edit:commercial',
    'channel:moderate',
    'chat:read',
    'chat:edit',
    'clips:edit',
    'moderator:manage:announcements',
    'moderator:manage:banned_users',
    'moderator:manage:blocked_terms',
    'moderator:manage:chat_messages',
    'moderator:manage:shoutouts',
    'moderator:manage:unban_requests',
    'moderator:manage:warnings',
    'moderator:read:chat_settings',
    'moderator:read:chatters',
    'moderator:read:followers',
    'moderator:read:moderators',
    'moderator:read:vips',
    'user:bot',
    'user:read:chat',
    'user:write:chat',
]

const USER_SCOPES = [
    'bits:read',
    'channel:bot',
    'channel:manage:broadcast',
    'channel:manage:polls',
    'channel:manage:predictions',
    'channel:manage:raids',
    'channel:manage:redemptions',
    'channel:manage:schedule',
    'channel:manage:videos',
    'channel:read:editors',
    'channel:read:hype_train',
    'channel:read:polls',
    'channel:read:predictions',
    'channel:read:redemptions',
    'channel:read:subscriptions',
    'channel:read:vips',
    'clips:edit',
    'moderation:read',
    'user:read:subscriptions',
]

export const getTwitchToken = async (type: string): Promise<AccessToken> => {
    let params: URLSearchParams
    let url: string = ''
    if (type === 'bot') {
        const id = process.env.BOT_ID || ''
        params = new URLSearchParams({
            id: process.env.BOT_ID || '',
            scopes: BOT_SCOPES.join(','),
        })

        url = `http://localhost:4000/api/token/${id}?${params.toString()}`
    } else if (type === 'user') {
        const id = process.env.TWITCH_ID || ''
        params = new URLSearchParams({
            scopes: USER_SCOPES.join(','),
        })
        url = `http://localhost:4000/api/token/${id}?${params.toString()}`
    } else {
        throw Error('Invalid token type requested.')
    }

    const response = await fetch(url)
    if (!response.ok) {
        log.bot.error(response)
        throw Error(`${type} access token not found in cache or database.`)
    }

    const { token } = (await response.json()) as TwitchTokenApiResponse

    if (type === 'bot') {
        redisClient.set(process.env.BOT_ID || '', JSON.stringify(token))
    } else if (type === 'user') {
        redisClient.set(process.env.TWITCH_ID || '', JSON.stringify(token))
    }

    return token
}

export const getSpotifyToken = async (
    twitchId: string,
): Promise<SpotifyAccessToken | null> => {
    const spotifyAccessToken = await redisClient.get(`${twitchId}_spotify`)

    if (!spotifyAccessToken) {
        const url = `http://localhost:4000/api/spotify-token/${twitchId}`
        const response = await fetch(url)

        if (!response.ok) {
            log.bot.error(response)
            throw Error(`Spotify access token not found in cache or database`)
        }

        const data = (await response.json()) as SpotifyAccessToken
        if (!data) {
            return null
        } else {
            redisClient.set(`${twitchId}_spotify`, JSON.stringify(data))
        }

        return data
    } else {
        return JSON.parse(spotifyAccessToken) as SpotifyAccessToken
    }
}

export const refreshSpotifyToken = async (
    twitchId: string,
): Promise<SpotifyAccessToken | null> => {
    const url = `https://localhost:4000/api/spotify-token/${twitchId}`

    const response = await fetch(url)

    if (!response || response.status !== 200) {
        return null
    }

    return (await response.json()) as SpotifyAccessToken
}

export const playAudio = async (twitchId: string): Promise<void> => {
    const url = `https://localhost:5000/api/audio/${twitchId}`
    const response = await fetch(url)

    if (!response.ok) {
        log.app.error(`Could not play audio file for twitch id: ${twitchId}`)
        return
    }
}

export const setupShutdownHandler = () => {
    const handleShutdown = (graceful: boolean) => {
        log.app.info(`Shutting down ${graceful ? 'gracefully' : 'forcefully'}.`)
    }

    process.on('SIGTERM', () => {
        handleShutdown(true)
    })

    process.on('SIGINT', () => {
        handleShutdown(true)
    })
}
