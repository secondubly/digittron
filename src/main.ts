import * as dotenv from 'dotenv'
import { dirname, resolve } from 'path'
import { Bot } from './bot.js'
import { fileURLToPath } from 'url'
import logger from './logger.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

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

const hasUndefined = (obj: object) => {
    return Object.values(obj).includes(undefined)
}
const main = async () => {
    if (hasUndefined(config)) {
        logger.error('undefined fields found in config file, please check your settings')
        process.exit(1)
    }

    if (CLIENT_ID && CLIENT_SECRET) {
        Bot.init(CLIENT_ID, CLIENT_SECRET)
    }
}

main()
