import { fileURLToPath } from 'url'
import { Bot } from './bot.js'
import logger from './logger.js'
import dotenv from 'dotenv'
import path from 'path'

if (process.env.NODE_ENV === 'production') {
    dotenv.config()
} else {
    logger.info('running in development mode')
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    dotenv.config({ path: __dirname + '/./../.env.development.local' })
}

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const BOT_ID = process.env.BOT_ID
const TWITCH_ID = process.env.TWITCH_ID

const config = {
    CLIENT_ID,
    CLIENT_SECRET,
    BOT_ID,
    TWITCH_ID,
}

const startup = () => {
    try {
        const hasUndefined = (obj: object) => {
            return Object.values(obj).includes(undefined)
        }

        if (hasUndefined(config)) {
            logger.error(
                'undefined fields found in config file, please check your settings',
            )
            process.exit(1)
        }

        if (CLIENT_ID && CLIENT_SECRET) {
            Bot.init(CLIENT_ID, CLIENT_SECRET)
        }
    } catch (e: unknown) {
        logger.error(`Startup failed: ${(e as Error).message}`)
        process.exit(1)
    }
}

startup()
