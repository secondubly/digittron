import {
  RefreshingAuthProvider,
  type AccessToken,
  type RefreshingAuthProviderConfig,
} from '@twurple/auth'
import { Bot, createBotCommand } from '@twurple/easy-bot'
import { EventSubWsListener } from '@twurple/eventsub-ws'
import { trackFirstMessages } from './services/tracker'
import { buildCommands } from './commands'
import { ApiClient } from '@twurple/api'
import { EventSubChannelRaidModerationEvent } from '@twurple/eventsub-base'

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
      TWITCH_BROADCASTER_SCOPES,
    } as RefreshingAuthProviderConfig)

    // on token refresh, update the appropriate file
    authProvider.onRefresh(async (userId: string, newTokenData: AccessToken) => {
      await Bun.write(`./data/tokens.${userId}.json`, JSON.stringify(newTokenData, null, 2)).catch(
        (err) => {
          console.error('Failed to save token', err.message)
        },
      )
    })

    await authProvider.addUserForToken(botToken, ['chat'])
    await authProvider.addUserForToken(ownerToken)
    const api = new ApiClient({ authProvider })

    const channels = (Bun.env.TWITCH_CHANNELS as string).split(',') as string[]

    const commands = buildCommands({ api })

    // add !commands to list of commands
    const available = createBotCommand('commands', (_, { say }) => {
      const commandList = commands.map((command) => `!${command.name}`).join(', ')
      say(`They do lots of things ➡️ [${commandList}]`)
    })
    commands.push(available)

    const bot = new Bot({ authProvider, channels, commands: buildCommands({ api }) })

    const listener = new EventSubWsListener({ apiClient: api })

    await trackFirstMessages({
      bot,
      api,
      listener,
      broadcasterId: ownerId,
      ignoreUserIds: [userId, ownerId], // ignore bot and streamer IDs
    })

    try {
      // REVIEW: do we really need this?
      await bot.api.requestScopesForUser(ownerId, TWITCH_BROADCASTER_SCOPES)
    } catch (error) {
      console.error('Could not request app scopes', error)
    }

    // event handlers
    let isFirstConnection = true
    bot.chat.onAuthenticationSuccess(() => {
      console.log('ready to yap 😃')

      const startupMessages = [
        'I’m here, so we‘re good.',
        'Sorry, fell asleep there for a second.',
        'Safe journeys. Straight aim. And good huntin‘.',
        'Psst, hey. Take me with you. I hate this job.',
      ]

      console.log(
        `${isFirstConnection ? 'Connected' : 'Reconnected'} to Twitch, requesting ${channels.length} channels: ${channels.join(', ')}`,
      )

      if (isFirstConnection) {
        const message = startupMessages[Math.floor(Math.random() * startupMessages.length)]
        channels.forEach((chan) => bot.say(chan, message))
        isFirstConnection = false
      }
    })

    const expectedChannels = new Set<string>(channels.map((c) => c.toLocaleLowerCase()))
    const joinedChannels = new Set<string>()

    bot.chat.onJoin((channel, _user) => {
      const lowercaseChannel = channel.toLocaleLowerCase()
      if (expectedChannels.has(lowercaseChannel) && !joinedChannels.has(lowercaseChannel)) {
        joinedChannels.add(lowercaseChannel)
        console.log(`Joined #${lowercaseChannel}`)
      }
    })

    bot.chat.onJoinFailure((channel, reason) => {
      console.log(`Failed to join: #${channel}: ${reason}`)
    })

    // listener handlers
    listener.onChannelModerate(ownerId, userId, async (event) => {
      if (!(event instanceof EventSubChannelRaidModerationEvent)) {
        return
      }
      const raidedChannel = event.userDisplayName
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

      const raidMsg = `Welcome raiders! Thank you so much for the raid ${event.raidingBroadcasterDisplayName}! Don't forget to give them a follow over at https://twitch.tv/${event.raidedBroadcasterName}!'}!`
      await bot.say(event.raidedBroadcasterName, raidMsg)

      // shoutout raider
      try {
        await bot.api.asUser(userId, async (ctx) => {
          await ctx.chat.shoutoutUser(ownerId, raiderId)
        })
      } catch (e) {
        if (e instanceof Error) {
          console.error(`Error: ${e.message}`)
        } else {
          console.error(`Unexpected error occurred: ${e}`)
        }
      }
    })

    return bot
  } catch (err) {
    console.error('Build error', err)
  }
}
