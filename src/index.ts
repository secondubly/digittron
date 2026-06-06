// import { init as apiInit } from './server/index.js'
import { init as webInit } from './web/index.js'
import { init as botInit } from './lib/utils.js'
import { connectRedis } from '@lib/services/redis.js'
import { log } from '@lib/services/logger.js'

const config = {
    API_PORT: process.env.API_PORT ?? '4001',
    WEB_PORT: process.env.WEB_PORT ?? '5001',
}

const startup = async () => {
    try {
        // TODO: fix shutdown handler
        // setupShutdownHandler()
        // start up api
        // await apiInit(parseInt(config.API_PORT))
        // Spin up cache
        await connectRedis()
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

startup().catch((err) => {
    log.app.error(`Failed to start bot: `, err)
})
