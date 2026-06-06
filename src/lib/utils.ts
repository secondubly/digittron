import { RefreshingAuthProvider, type AccessToken } from '@twurple/auth'
import redisClient from './services/redis.js'
import { log } from './services/logger.js'
import { config } from 'src/config.js'
import { Bot } from 'src/bot/bot.js'
import { registerShutdownHandlers } from './bot/utils.js'

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

export const getTwitchToken = async (
    twitchId: string,
): Promise<AccessToken> => {
    const params = new URLSearchParams({
        id: twitchId,
        scopes:
            twitchId === config.TWITCH_BOT_ID
                ? BOT_SCOPES.join(',')
                : USER_SCOPES.join(','),
    })

    const url = `http://localhost:4000/api/token/${id}?${params.toString()}`

    const response = await fetch(url)
    if (!response.ok) {
        log.bot.error(response)
        throw Error(
            `Access token for ${twitchId} not found in cache or database.`,
        )
    }

    const token = (await response.json()) as AccessToken

    redisClient.set(twitchId, JSON.stringify(token))
    return token
}

export const playAudio = async (twitchId: string): Promise<void> => {
    const url = `http://localhost:4000/api/audio/${twitchId}`
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

const getAccessToken = async (twitchId: string): Promise<AccessToken> => {
    const accessTokenString = await redisClient.get(twitchId)

    let accessToken = !accessTokenString
        ? null
        : (JSON.parse(accessTokenString) as AccessToken)

    if (!accessToken) {
        log.bot.info(
            `Access token for ${twitchId} not found in cache, checking database...`,
        )
        accessToken = await getTwitchToken(twitchId)
    }

    return accessToken
}

export const init = async () => {
    const authProvider = new RefreshingAuthProvider({
        clientId: config.TWITCH_CLIENT_ID,
        clientSecret: config.TWITCH_CLIENT_SECRET,
    })

    authProvider.onRefresh(async (userId, newTokenData) => {
        await redisClient.set(userId, JSON.stringify(newTokenData))
        log.bot.info(
            `Token refreshed for ${userId === config.TWITCH_BOT_ID ? 'bot' : 'broadcaster'}`,
        )
        log.bot.debug(`Token Info: ${JSON.stringify(newTokenData)})`)
    })

    const broadcasterTokenString = await redisClient.get(
        config.TWITCH_BROADCASTER_ID,
    )

    let broadcasterAccessToken =
        broadcasterTokenString === null
            ? null
            : (JSON.parse(broadcasterTokenString) as AccessToken)
    if (!broadcasterAccessToken) {
        log.bot.info(
            'Broadcaster access token not found in cache, checking database...',
        )

        broadcasterAccessToken = await getAccessToken(
            config.TWITCH_BROADCASTER_ID,
        )
    }

    await authProvider.addUser(
        Number(config.TWITCH_BROADCASTER_ID),
        broadcasterAccessToken,
    )

    const botTokenString = await redisClient.get(config.TWITCH_BOT_ID)
    let botAccessToken =
        botTokenString === null
            ? null
            : (JSON.parse(botTokenString) as AccessToken)
    if (!botAccessToken) {
        log.bot.info(
            'Bot access token not found in cache, checking database...',
        )

        botAccessToken = await getAccessToken(config.TWITCH_BOT_ID)
    }

    await authProvider.addUser(Number(config.TWITCH_BOT_ID), botAccessToken, [
        'chat',
    ])

    const bot = new Bot(authProvider, config.TWITCH_CHANNELS)
    registerShutdownHandlers(bot)
    bot.start()
    return bot
}
