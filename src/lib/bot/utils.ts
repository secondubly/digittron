import { log } from '@lib/services/logger'
import type { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'
import type { Bot } from 'src/bot/bot.js'

const SHUTDOWN_TIMEOUT_MS = 5_000

export function parseUser(msg: EventSubChannelChatMessageEvent) {
    return {
        id: msg.chatterId,
        username: msg.chatterName,
        displayName: msg.chatterDisplayName,
        isBroadcaster: msg.chatterId === msg.broadcasterId,
        isMod: Object.keys(msg.badges).some((b) => b === 'moderator'),
        isVip: Object.keys(msg.badges).some((b) => b === 'vip'),
        isSub: Object.keys(msg.badges).some((b) => b === 'subscriber'),
        bits: msg.bits ?? 0,
    }
}

export async function gracefulShutdown(
    bot: Bot,
    signal: string,
): Promise<never> {
    log.app.info(`Received ${signal}, shutting down...`)

    const timeout = setTimeout(() => {
        log.app.error('Shutdown timed out, forcing exit.')
        process.exit(1)
    }, SHUTDOWN_TIMEOUT_MS)

    try {
        await bot.stop()
        clearTimeout(timeout)
        log.app.info('But shut down successfully')
        process.exit(0)
    } catch (err) {
        clearTimeout(timeout)
        log.app.error(`Error during shutdown: ${err}`)
        process.exit(1)
    }
}

export function registerShutdownHandlers(bot: Bot): void {
    const handler = (signal: string) => gracefulShutdown(bot, signal)

    process.on('SIGINT', () => handler('SIGINT')) // ctrl+c
    process.on('SIGTERM', () => handler('SIGTERM')) // docker / pm2 stop
    process.on('SIGHUP', () => handler('SIGHUP')) // terminal closed

    process.on('uncaughtException', (err) => {
        console.error('Uncaught exception:', err)
        gracefulShutdown(bot, 'uncaughtException')
    })

    process.on('unhandledRejection', (reason) => {
        console.error('Unhandled rejection:', reason)
        gracefulShutdown(bot, 'unhandledRejection')
    })
}
