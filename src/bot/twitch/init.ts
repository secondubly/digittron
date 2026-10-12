import { Bot, createBotCommand } from '@twurple/easy-bot'
import { trackFirstMessages } from './services/tracker'
import { buildCommands } from './commands'
import { EventSubChannelRaidModerationEvent } from '@twurple/eventsub-base'
import { log, twurpleLogger } from '@core/logger'
import type { Twitch } from '@core/twitch'

export { TWITCH_BROADCASTER_SCOPES } from '@core/twitch' // other files may still import it from here
 
const STARTUP_MESSAGES = [
    'I’m here, so we‘re good.',
    'Sorry, fell asleep there for a second.',
    'Safe journeys. Straight aim. And good huntin‘.',
    'Psst, hey. Take me with you. I hate this job.',
]

export const init = async ({ authProvider, api, listener, botId, ownerId, channels }: Twitch) => {

    const commands = buildCommands({ api, auth: authProvider, botId })

    // add !commands to list of commands
    commands.push(
      createBotCommand('commands', (_, { say }) => {
            const list = commands.map((command) => `!${command.name}`).join(', ')
            say(`They do lots of things ➡️ [${list}]`)
      }),
    )
    const bot = new Bot({ 
      authProvider, 
      channels, 
      commands, 
      chatClientOptions: { logger: twurpleLogger('twurple:chat')}
    })

    let greeted = false
    bot.chat.onAuthenticationSuccess(() => {
        if (greeted) return
        greeted = true
        const message = STARTUP_MESSAGES[Math.floor(Math.random() * STARTUP_MESSAGES.length)]
        if (message) channels.forEach((channel) => void bot.say(channel, message))
    })
 
    await trackFirstMessages({
        bot,
        api,
        listener,
        broadcasterId: ownerId,
        ignoreUserIds: [botId, ownerId], // ignore the bot and the streamer
    })
 
    // Raids started from this channel
    listener.onChannelModerate(ownerId, botId, async (event) => {
        if (!(event instanceof EventSubChannelRaidModerationEvent)) return
 
        const target = event.userDisplayName
        log.twitch.info({ target }, 'started a raid')
 
        const messages = [
            `We're raiding @${target}!`,
            'Use this as the raid message: second15Raid 01010010 01000001 01001001 01000100 00100001 00100001 00100001 second15Raid',
        ]
        for (const message of messages) {
            await bot.say(event.broadcasterName, message)
            await Bun.sleep(1500) // wait a bit before sending the next message
        }
    })
 
    // Raids coming into this channel
    listener.onChannelRaidTo(ownerId, async (event) => {
        const raiderId = event.raidingBroadcasterId
        log.twitch.info({ raider: event.raidingBroadcasterName, viewers: event.viewers }, 'incoming raid')
 
        await bot.say(
            event.raidedBroadcasterName,
            `Welcome raiders! Thank you so much for the raid ${event.raidingBroadcasterDisplayName}! ` +
                `Don't forget to give them a follow over at https://twitch.tv/${event.raidingBroadcasterName}!`,
        )
 
        try {
            await api.asUser(botId, async (ctx) => {
                await ctx.chat.shoutoutUser(ownerId, raiderId)
            })
        } catch (err) {
            log.twitch.error({ err, raiderId }, 'shoutout failed')
        }
    })
 
    return bot
}
