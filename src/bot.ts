import { RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient, ChatMessage } from '@twurple/chat'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { existsSync, promises, mkdir } from 'fs'
import { readFile } from 'fs/promises'

dotenv.config({ path: resolve(__dirname, '../.env') })

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const TOKEN_PATH = resolve(__dirname, '../src/tokens/')

const main = async () => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        // TODO: throw error
        console.log('client id or client secret not available')
        process.exit(1)
    }

    const tokenData = JSON.parse(
        await readFile(resolve(TOKEN_PATH, '{botId}.json'), 'utf-8'),
    )

    const authProvider = new RefreshingAuthProvider({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
    })

    // add bot user to auth provider
    await authProvider.addUserForToken(tokenData, ['chat'])

    const chatClient = new ChatClient({
        authProvider,
        channels: ['secondubly'],
    })

    authProvider.onRefresh(async (userId, newTokenData) => {
        if (!existsSync(TOKEN_PATH)) {
            mkdir(TOKEN_PATH, (error) =>
                error ? console.log(error) : console.log('directory created'),
            )
        }
        await promises.writeFile(
            resolve(TOKEN_PATH, `${userId}.json`),
            JSON.stringify(newTokenData, null, 4),
            'utf-8',
        )
    })

    chatClient.connect()

    chatClient.onMessage(
        async (channel: string, user: string, text: string) => {
            console.log(`${user}: ${text}`)
            if (text === '!test') {
                chatClient.say(channel, 'hello')
            }
        },
    )
}

main()
