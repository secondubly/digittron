import type { RefreshingAuthProvider } from '@twurple/auth'
import type { Bot } from '@twurple/easy-bot'
import { makeLogger } from '../../../core/logger'

const log = makeLogger('bot')
const channels = (Bun.env.TWITCH_CHANNELS as string).split(',') as string[]


export function logBotEvents(bot: Bot, authProvider: RefreshingAuthProvider) {
    bot.onAuthenticationSuccess(() => {
      const startupMessages = [
        'I’m here, so we‘re good.',
        'Sorry, fell asleep there for a second.',
        'Safe journeys. Straight aim. And good huntin‘.',
        'Psst, hey. Take me with you. I hate this job.',
      ]

        
        let connectedOnce = false

        bot.chat.onAuthenticationSuccess(() => {
            log.info(connectedOnce ? 'reconnected to Twitch' : 'connected to Twitch')
            connectedOnce = true

            if (!connectedOnce) {
                const message = startupMessages[Math.floor(Math.random() * startupMessages.length)]
                channels.forEach((chan) => bot.say(chan, message))
                connectedOnce = true
            }
        })
    })

    bot.onAuthenticationFailure((message, retryCount) => {
        log.error({ message, retryCount }, 'Twitch authentication failed')
    })

    bot.onTokenFetchFailure((err) => {
        log.error({ err }, 'could not get a chat token')
    })

    bot.onDisconnect((manually, reason) => {
        if (manually) log.info('disconnected from Twitch (requested)')
        else log.warn({ err: reason }, 'lost connection to Twitch, reconnecting')
    })

    bot.onJoin((e) => log.info({ channel: e.broadcasterName }, 'joined channel'))

    bot.onJoinFailure((e) => {
        log.warn({ channel: e.broadcasterName, reason: e.reason }, 'failed to join channel')
    })

    // rate limits, duplicate messages, slow mode and similar
    bot.onMessageFailed((channel, reason) => {
        log.warn({ channel, reason }, 'message was not sent')
    })

    // Log the user ID only. The token data itself must never end up in logs.
    authProvider.onRefreshFailure((userId, err) => log.error({ userId, err }, 'token refresh failed'))
}