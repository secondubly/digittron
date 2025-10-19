import { Bot } from './bot.js'
import logger from './logger.js'
import dotenv from 'dotenv'

// TODO: only do this in dev enviroments
dotenv.config()

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
        logger.error(
            'undefined fields found in config file, please check your settings',
        )
        process.exit(1)
    }

    if (CLIENT_ID && CLIENT_SECRET) {
        Bot.init(CLIENT_ID, CLIENT_SECRET)
    }
}

main()
