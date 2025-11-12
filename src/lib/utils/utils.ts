import { AccessToken } from '@twurple/auth'
import { TokenApiResponse } from '../../types.js'
import redisClient from './redis.js'

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

const getToken = async (type: string): Promise<AccessToken> => {
    let params: URLSearchParams
    if (type === 'bot') {
        params = new URLSearchParams({
            id: process.env.BOT_ID || '',
            scopes: BOT_SCOPES,
        })
    } else if (type === 'user') {
        params = new URLSearchParams({
            id: process.env.TWITCH_ID || '',
            scopes: USER_SCOPES,
        })
    } else {
        throw Error('Invalid token type requested.')
    }

    const url = `http://localhost:8080/api/token?${params.toString()}`
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

export default getToken
