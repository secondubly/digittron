import type { AccessToken } from '@twurple/auth'
import type { TokenApiResponse } from '../bot/types.js'
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

export const getToken = async (type: string): Promise<AccessToken> => {
    let params: URLSearchParams
    if (type === 'bot') {
        params = new URLSearchParams({
            id: process.env.BOT_ID || '',
            scopes: BOT_SCOPES.join(','),
        })
    } else if (type === 'user') {
        params = new URLSearchParams({
            id: process.env.TWITCH_ID || '',
            scopes: USER_SCOPES.join(','),
        })
    } else {
        throw Error('Invalid token type requested.')
    }

    const url = `http://localhost:5000/api/token?${params.toString()}`
    const response = await fetch(url)
    if (!response.ok) {
        throw Error(`${type} access token not found in cache or database.`)
    }

    const { token } = (await response.json()) as TokenApiResponse

    if (type === 'bot') {
        redisClient.set(process.env.BOT_ID || '', JSON.stringify(token))
    } else if (type === 'user') {
        redisClient.set(process.env.TWITCH_ID || '', JSON.stringify(token))
    }

    return token
}

export const playAudio = async (twitchId: string): Promise<void> => {
    const url = `https://localhost:8000/api/audio/${twitchId}`
    const response = await fetch(url)

    if (!response.ok) {
        log.app.error(`Could not play audio file for twitch id: ${twitchId}`)
        return
    }
}
