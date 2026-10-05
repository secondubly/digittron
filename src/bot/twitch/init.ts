import { RefreshingAuthProvider, type AccessToken, type RefreshingAuthProviderConfig } from "@twurple/auth";
import { Bot, BotCommand, createBotCommand } from "@twurple/easy-bot";
import { buildCommands } from "./commands";
import { ApiClient } from "@twurple/api";

// these will be used as app implied scopes
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
  'user:read:subscriptions',
]

export const init = async() => {
    if (!Bun.env.TWITCH_CLIENT_ID || !Bun.env.TWITCH_CLIENT_SECRET || !Bun.env.TWITCH_CHANNELS) {
        throw new Error("Missing required environment variables.")
    }

    const userId = Bun.env.TWITCH_USER_ID || "113565139" // twitch bot id, not broadcaster
    const ownerId = Bun.env.OWNER_ID || "89181064"
    const tokenPath = (id: string) => `./tokens.${id}.json`

    async function loadToken(id: string) {
        const file = tokenPath(id)
        try {
            return await Bun.file(file).json()
        } catch {
            throw new Error(`Could not read token file: ${file}`)
        }
    }

    const [botToken, ownerToken] = await Promise.all([
        loadToken(userId),
        loadToken(ownerId)
    ])

    try {

        const authProvider = new RefreshingAuthProvider({
            clientId: Bun.env.TWITCH_CLIENT_ID,
            clientSecret: Bun.env.TWITCH_CLIENT_SECRET,
            TWITCH_BROADCASTER_SCOPES
        } as RefreshingAuthProviderConfig)

        // on token refresh, update the appropriate file
        authProvider.onRefresh(async (userId: string, newTokenData: AccessToken) => {
            await Bun.write(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 2)).catch(err => {
                console.error('Failed to save token', err.message)
            })
        })
        
        await authProvider.addUserForToken(botToken, ['chat'])
        await authProvider.addUserForToken(ownerToken)
        const api = new ApiClient({ authProvider })

        const channels = (Bun.env.TWITCH_CHANNELS as string).split(',') as string[]
        console.log('channels', channels)

        const bot = new Bot({ authProvider, channels, commands: buildCommands({ api }) })

        try {
            await bot.api.requestScopesForUser(ownerId, TWITCH_BROADCASTER_SCOPES)
        } catch (error) {
            console.error('Could not request app scopes', error)
        }

        bot.chat.onJoin((channel, _user) => {
        const normalizedChannel = channel.toLowerCase().replace(/^#/, '')
            console.info(`Joined #${normalizedChannel}`)
        })

        return bot
    } catch (err) {
        console.error('Build error', err)
    }   
}