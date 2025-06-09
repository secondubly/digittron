import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { Bot } from './bot'

dotenv.config({ path: resolve(__dirname, '../.env') })

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

const main = async () => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        // TODO: throw error
        console.log('client id or client secret not available')
        process.exit(1)
    }

    Bot.init(CLIENT_ID, CLIENT_SECRET)
}

main()
