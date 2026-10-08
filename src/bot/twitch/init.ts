import { RefreshingAuthProvider, type AccessToken } from '@twurple/auth'
import { Bot, createBotCommand } from '@twurple/easy-bot'
import { EventSubWsListener } from '@twurple/eventsub-ws'
import { trackFirstMessages } from './services/tracker'
import { buildCommands } from './commands'
import { ApiClient } from '@twurple/api'
import { EventSubChannelRaidModerationEvent } from '@twurple/eventsub-base'
import { log, twurpleLogger } from '@core/logger'
import { onShutdown } from '@core/shutdown'

export const init = async () => {
  if (!Bun.env.TWITCH_CLIENT_ID || !Bun.env.TWITCH_CLIENT_SECRET || !Bun.env.TWITCH_CHANNELS) {
    throw new Error('Missing required environment variables.')
  }

  const userId = Bun.env.TWITCH_BOT_ID || '113565139' // twitch bot id, not broadcaster
  const ownerId = Bun.env.TWITCH_OWNER_ID || '89181064'
  const tokenPath = (id: string) => `./data/tokens.${id}.json`

  async function loadToken(id: string) {
    const file = tokenPath(id)
    try {
      return await Bun.file(file).json()
    } catch {
      throw new Error(`Could not read token file: ${file}`)
    }
  }

  const [botToken, ownerToken] = await Promise.all([loadToken(userId), loadToken(ownerId)])

  try {
    const authProvider = new RefreshingAuthProvider({
      clientId: Bun.env.TWITCH_CLIENT_ID,
      clientSecret: Bun.env.TWITCH_CLIENT_SECRET,
    })

    // on token refresh, update the appropriate file
    authProvider.onRefresh(async (userId: string, newTokenData: AccessToken) => {
      try {
        await Bun.write(`./data/tokens.${userId}.json`, JSON.stringify(newTokenData, null, 2))
        log.twitch.debug({ userId }, 'access token refreshed and saved')
      } catch (err) {
        log.twitch.error({ err, userId }, 'failed to save refreshed token')
      }
    })

    await authProvider.addUserForToken(botToken, ['chat'])
    await authProvider.addUserForToken(ownerToken)
    const api = new ApiClient({ authProvider, logger: twurpleLogger('twurple:api') })

    const channels = (Bun.env.TWITCH_CHANNELS as string).split(',') as string[]

    const commands = buildCommands({ api })

    // add !commands to list of commands
    const available = createBotCommand('commands', (_, { say }) => {
      const commandList = commands.map((command) => `!${command.name}`).join(', ')
      say(`They do lots of things ➡️ [${commandList}]`)
    })
    commands.push(available)

    const bot = new Bot({ authProvider, channels, commands })

    const listener = new EventSubWsListener({
      apiClient: api,
      logger: twurpleLogger('twurple:eventsub'),
    })

    await trackFirstMessages({
      bot,
      api,
      listener,
      broadcasterId: ownerId,
      ignoreUserIds: [userId, ownerId], // ignore bot and streamer IDs
    })

    // listener handlers
    listener.onChannelModerate(ownerId, userId, async (event) => {
      if (!(event instanceof EventSubChannelRaidModerationEvent)) {
        return
      }
      const raidedChannel = event.userDisplayName

      log.twitch.info({ raidedChannel }, 'started a raid')
      const messages = [
        `We're raiding @${raidedChannel}!`,
        `Use this as the raid message: second15Raid 01010010 01000001 01001001 01000100 00100001 00100001 00100001 second15Raid`,
      ]
      for (const message of messages) {
        bot.say(event.broadcasterName, message)
        // wait a bit before sending the next message
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
    })

    listener.onChannelRaidTo(ownerId, async (event) => {
      // get game info for raidingUser
      const raiderId = event.raidingBroadcasterId

      const raidMsg = `Welcome raiders! Thank you so much for the raid ${event.raidingBroadcasterDisplayName}! Don't forget to give them a follow over at https://twitch.tv/${event.raidingBroadcasterName}!`
      await bot.say(event.raidedBroadcasterName, raidMsg)

      // shoutout raider
      try {
        await bot.api.asUser(userId, async (ctx) => {
          await ctx.chat.shoutoutUser(ownerId, raiderId)
        })
      } catch (e) {
        if (e instanceof Error) {
          log.twitch.error({ e, raiderId }, 'shoutout failed')
        } else {
          log.twitch.error({ e }, 'error occurred')
        }
      }
    })

    // handle bot shutdown
    onShutdown('bot-quit', async () => {
      log.twitch.info('Shutting down bot...')
      // delete eventsub subscriptions
      await bot.api.eventSub.deleteAllSubscriptions()
      // leave chatrooms
      bot.chat.quit()
      log.twitch.info('Bot shut down successfully')
    })

    return bot
  } catch (err) {
    log.app.error({ err }, 'Build error')
  }
}
