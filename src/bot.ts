import { AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient } from '@twurple/chat'
import { stat, mkdir, writeFile, readFile } from 'fs/promises'
import { resolve } from 'path'

const TOKEN_PATH = resolve(__dirname, '../src/tokens/')

export class Bot {
    authProvider: RefreshingAuthProvider
    chatClient: ChatClient
    TOKEN_PATH = resolve(__dirname, '../src/tokens/')

    private constructor(
        chatClient: ChatClient,
        authProvider: RefreshingAuthProvider,
    ) {
        this.chatClient = chatClient
        this.authProvider = authProvider
    }

    static async init(clientID: string, clientSecret: string): Promise<Bot> {
        const authProvider = new RefreshingAuthProvider({
            clientId: clientID,
            clientSecret,
        })

        const tokenData = JSON.parse(
            await readFile(resolve(TOKEN_PATH, '113565139.json'), 'utf-8'),
        )

        await authProvider.addUserForToken(tokenData, ['chat'])
        authProvider.onRefresh(this.handleRefresh)

        const chatClient = new ChatClient({
            authProvider,
            channels: ['secondubly'],
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

        return new Bot(chatClient, authProvider)
    }

    static async handleRefresh(userId: string, newTokenData: AccessToken) {
        try {
            await stat(TOKEN_PATH)
            await writeFile(
                resolve(TOKEN_PATH, `${userId}.json`),
                JSON.stringify(newTokenData, null, 4),
                'utf-8',
            )
        } catch (error) {
            if (this.hasErrorCode(error))
                if (error.code === 'ENOENT') {
                    try {
                        await mkdir(TOKEN_PATH)
                        console.log('created token directory')
                    } catch (err) {
                        console.error((err as Error).message)
                    }
                }
        }
    }

    // eslint-disable-next-line
    static hasErrorCode(error: any): error is { code: string } {
        return error && typeof error === 'object' && 'code' in error
    }
}
