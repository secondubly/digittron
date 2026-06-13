import { init as apiInit } from './server/index.js'
// import { init as webInit } from './web/index.js'
import { init as botInit } from './lib/utils.js'
import { log } from '@lib/services/logger.js'
import { config } from './config/env.js'

const main = async () => {
    const server = await apiInit()
    botInit(config.TWITCH_CHANNELS, server.tokenStore)
    // webInit(parseInt(config.WEB_PORT))
}

main().catch((err) => {
    log.app.error(`Failed to start app: `, err)
})
