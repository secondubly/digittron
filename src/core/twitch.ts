// The chat bot and the overlay's chat both use what this returns, so we store it in core
import { ApiClient } from '@twurple/api'
import { RefreshingAuthProvider, type AccessToken } from '@twurple/auth'
import { EventSubWsListener } from '@twurple/eventsub-ws'
import { log, twurpleLogger } from './logger'

// Scopes the owner's token should carry. Scopes can't be upgraded at runtime, so if the startup
// warning lists any of these, re-authorize the owner token with them added.
export const TWITCH_BROADCASTER_SCOPES = [
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
    'channel:read:ads',
    'channel:read:vips',
    'clips:edit',
    'moderation:read',
    'user:read:chat', // EventSub chat messages, which the overlay depends on
    'user:read:subscriptions',
]

export interface Twitch {
    authProvider: RefreshingAuthProvider
    api: ApiClient
    listener: EventSubWsListener
    botId: string // the chat bot's account
    ownerId: string // the broadcaster
    channels: string[] // channels the chat bot joins
}

const tokenPath = (id: string) => `./data/tokens.${id}.json`

async function loadToken(id: string): Promise<AccessToken> {
    const file = tokenPath(id)
    try {
        return (await Bun.file(file).json()) as AccessToken
    } catch {
        throw new Error(`Could not read token file: ${file}`)
    }
}

export async function createTwitch(): Promise<Twitch> {
    const { TWITCH_CLIENT_ID: clientId, TWITCH_CLIENT_SECRET: clientSecret, TWITCH_CHANNELS } = Bun.env
    if (!clientId || !clientSecret || !TWITCH_CHANNELS) {
        throw new Error('Missing required environment variables.')
    }

    const botId = Bun.env.TWITCH_BOT_ID || '113565139' // twitch bot id, not broadcaster
    const ownerId = Bun.env.TWITCH_OWNER_ID || '89181064'
    const channels = TWITCH_CHANNELS.split(',')
        .map((c) => c.trim())
        .filter(Boolean)

    const [botToken, ownerToken] = await Promise.all([loadToken(botId), loadToken(ownerId)])

    const authProvider = new RefreshingAuthProvider({ clientId, clientSecret })

    // Log the user ID only. Token data itself must never end up in logs.
    authProvider.onRefresh(async (userId, newTokenData) => {
        try {
            await Bun.write(tokenPath(userId), JSON.stringify(newTokenData, null, 2))
            log.app.debug({ userId }, 'access token refreshed and saved')
        } catch (err) {
            log.app.error({ err, userId }, 'failed to save refreshed token')
        }
    })
    authProvider.onRefreshFailure((userId, err) => log.app.error({ userId, err }, 'token refresh failed'))

    await authProvider.addUserForToken(botToken, ['chat'])
    await authProvider.addUserForToken(ownerToken)

    const have = new Set(authProvider.getCurrentScopesForUser(ownerId))
    const missing = TWITCH_BROADCASTER_SCOPES.filter((scope) => !have.has(scope))
    if (missing.length) log.app.warn({ missing }, 'owner token is missing scopes; re-authorize it to use those features')
    if (!have.has('user:read:chat')) log.app.error('owner token lacks user:read:chat, so overlay chat will not work')

    const api = new ApiClient({ authProvider, logger: twurpleLogger('twurple:api') })
    const listener = new EventSubWsListener({ apiClient: api, logger: twurpleLogger('twurple:eventsub') })

    return { authProvider, api, listener, botId, ownerId, channels }
}