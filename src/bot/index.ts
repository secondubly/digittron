import { connectRedis } from '@lib/utils/redis.js'
import { Bot } from './bot.js'
import { log } from '@lib/utils/logger.js'

export const startup = () => {
    const CLIENT_ID = process.env.CLIENT_ID
    const CLIENT_SECRET = process.env.CLIENT_SECRET

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new ReferenceError(
            'Client ID and/or Client Secret not found in config file.',
        )
    }

    if (process.env.NODE_ENV === 'development') {
        log.app.info('Running in development mode')
    }
    Bot.init(CLIENT_ID, CLIENT_SECRET)
}
if (import.meta.main) {
    connectRedis()
    startup()
}
