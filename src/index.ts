import { init as apiInit } from './api/index.js'
import { init as webInit } from './web/index.js'
import { startup as botInit } from './bot/index.js'
import { connectRedis } from '@lib/utils/redis.js'
import { setupShutdownHandler } from '@lib/utils/utils.js'
import { log } from '@lib/utils/logger.js'
const config = {
    API_PORT: process.env.API_PORT ?? '4001',
    WEB_PORT: process.env.WEB_PORT ?? '5001',
}

const startup = async () => {
    try {
        setupShutdownHandler()
        // Spin up cache
        connectRedis()
        // start up api
        apiInit(parseInt(config.API_PORT))
        // start bot
        botInit()
        // start frontend
        webInit(parseInt(config.WEB_PORT))
    } catch (error) {
        log.app.error(error)
        if (error instanceof ReferenceError) {
            process.exit(1)
        }
    }
}

if (import.meta.main) {
    startup()
}
