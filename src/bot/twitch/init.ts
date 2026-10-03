import { RefreshingAuthProvider, type AccessToken, type RefreshingAuthProviderConfig } from "@twurple/auth";
import { Bot, BotCommand, createBotCommand } from "@twurple/easy-bot";

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
] as const

export const init = async() => {
    if (!Bun.env.TWITCH_CLIENT_ID || !Bun.env.TWITCH_CLIENT_SECRET || !Bun.env.TWITCH_CHANNELS) {
        throw new Error("Missing required environment variables.")
    }

    const userId = Bun.env.TWITCH_USER_ID || "113565139" // twitch bot id, not broadcaster
    const tokenFile = `./tokens.${userId}.json`

    try {
        const tokenData = await Bun.file(tokenFile)
            .json()
            .catch(() => {
                throw new Error(`Could not read token file: ${tokenFile}`)
            })

            const authProvider = new RefreshingAuthProvider({
                clientId: Bun.env.TWITCH_CLIENT_ID,
                clientSecret: Bun.env.TWITCH_CLIENT_SECRET
            } as RefreshingAuthProviderConfig)

            // on token refresh, update the appropriate file
            authProvider.onRefresh(async (userId: string, newTokenData: AccessToken) => {
                await Bun.write(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 2)).catch(err => {
                    console.error('Failed to save token', err.message)
                })
            })
            
            await authProvider.addUserForToken(tokenData, ['chat'])

            const channels = (Bun.env.TWITCH_CHANNELS as string).split(',') as string[]

            const bot = new Bot({ authProvider, channels })

            return bot
    } catch (err) {
        console.error('Build error', err)
    }   
}