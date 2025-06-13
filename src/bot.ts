import { AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient, ChatMessage } from '@twurple/chat'
import { find } from 'linkifyjs'
import { ApiClient } from '@twurple/api'
import redis from 'redis'

const redisClient = await redis
    .createClient({
        url: 'redis://localhost:6379',
    })
    .on('connect', () => console.log('connected to redis'))
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect()

export class Bot {
    authProvider: RefreshingAuthProvider
    apiClient: ApiClient
    chatClient: ChatClient

    private constructor(
        chatClient: ChatClient,
        authProvider: RefreshingAuthProvider,
        apiClient: ApiClient,
    ) {
        this.chatClient = chatClient
        this.authProvider = authProvider
        this.apiClient = apiClient
    }

    static async init(clientID: string, clientSecret: string): Promise<Bot> {
        const authProvider = new RefreshingAuthProvider({
            clientId: clientID,
            clientSecret,
        })

        const botTokenString = await redisClient.get('113565139')
        if (!botTokenString) {
            console.log('Could not retrieve bot token!')
            process.exit(1)
        }

        const botTokenData = JSON.parse(botTokenString) as AccessToken

        const channelTokenString = await redisClient.get('89181064')
        if (!channelTokenString) {
            console.log('Could not retrieve streamer token!')
            process.exit(1)
        }
        const channelTokenData = JSON.parse(channelTokenString) as AccessToken

        await authProvider.addUserForToken(botTokenData, ['chat'])
        await authProvider.addUserForToken(channelTokenData)

        authProvider.onRefresh(
            async (userId: string, newTokenData: AccessToken) => {
                try {
                    redisClient
                        .set(userId, JSON.stringify(newTokenData))
                        .then(() => {
                            console.log(`token refreshed for ${userId}`)
                        })
                } catch (error) {
                    console.error((error as Error).message)
                }
            },
        )

        const chatClient = new ChatClient({
            authProvider,
            channels: ['secondubly'],
        })

        const apiClient = new ApiClient({
            authProvider,
        })

        chatClient.connect()

        chatClient.onMessage(
            async (
                channel: string,
                user: string,
                text: string,
                msg: ChatMessage,
            ) => {
                console.log(`${user}: ${text}`)
                if (text === '!test') {
                    chatClient.say(channel, 'hello')
                    return
                } else if (find(text).length > 0) {
                    if (msg.userInfo.isBroadcaster || msg.userInfo.isMod) {
                        return
                    }
                    if (!msg.channelId) {
                        // log an error
                        return
                    }
                    // timeout users who post links
                    // REVIEW: should we ignore emails?
                    apiClient.moderation.banUser(msg.channelId, {
                        duration: 1,
                        reason: 'for posting links (temporary)',
                        user: msg.userInfo.userId,
                    })
                }
            },
        )

        return new Bot(chatClient, authProvider, apiClient)
    }

    static async handleRefresh(userId: string, newTokenData: AccessToken) {
        try {
            redisClient.set(userId, JSON.stringify(newTokenData)).then(() => {
                console.log(`token refreshed for ${userId}`)
            })
        } catch (error) {
            console.error((error as Error).message)
        }
    }

    // eslint-disable-next-line
    static hasErrorCode(error: any): error is { code: string } {
        return error && typeof error === 'object' && 'code' in error
    }
}
