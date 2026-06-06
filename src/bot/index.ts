import { connectRedis } from '@lib/services/redis.js'
import { log } from '@lib/services/logger.js'
import { init } from '@lib/utils.js'
import { config } from 'src/config'

export const startup = () => {
    if (config.NODE_ENV === 'development') {
        log.bot.info('Running in development mode')
    }

    init()
}
if (import.meta.main) {
    await connectRedis()
    startup()
}
