import { AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient, ChatMessage, ChatRaidInfo } from '@twurple/chat'
import { find } from 'linkifyjs'
import { ApiClient } from '@twurple/api'
import redis from 'redis'
import logger from './logger.js'

const redisClient = await redis
    .createClient({
        url: 'redis://localhost:6379',
    })
    .on('connect', () => logger.info('connected to redis'))
    .on('error', (err) => logger.error('Redis Client Error', err))
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

        authProvider.onRefresh(this.handleRefresh)

        this.chatClient.onRaid(this.handleRaid)
        this.chatClient.onMessage(this.handleMessage)

        chatClient.onAuthenticationSuccess(() => {
            logger.info("I've successfully connected!")
        })

        chatClient.connect()
    }

    static async init(clientID: string, clientSecret: string): Promise<Bot> {
        const authProvider = new RefreshingAuthProvider({
            clientId: clientID,
            clientSecret,
        })

        const botTokenString = await redisClient.get('113565139')
        if (!botTokenString) {
            logger.error('Could not retrieve bot token!')
            process.exit(1)
        }

        const botTokenData = JSON.parse(botTokenString) as AccessToken

        const channelTokenString = await redisClient.get('89181064')
        if (!channelTokenString) {
            logger.error('Could not retrieve streamer token!')
            process.exit(1)
        }
        const channelTokenData = JSON.parse(channelTokenString) as AccessToken

        await authProvider.addUserForToken(botTokenData, ['chat'])
        await authProvider.addUserForToken(channelTokenData)

        const chatClient = new ChatClient({
            authProvider,
            channels: ['secondubly'],
        })

        const apiClient = new ApiClient({
            authProvider,
        })

        return new Bot(chatClient, authProvider, apiClient)
    }

    private async handleRefresh(userId: string, newTokenData: AccessToken) {
        try {
            redisClient.set(userId, JSON.stringify(newTokenData)).then(() => {
                logger.info(`token refreshed for ${userId}`)
            })
        } catch (error) {
            logger.error((error as Error).message)
        }
    }

    private async handleRaid(
        channel: string,
        user: string,
        raidInfo: ChatRaidInfo,
    ) {
        const raidee = raidInfo.displayName
        const raideeUser = await this.apiClient.users.getUserByName(raidee)
        const channelUser = await this.apiClient.users.getUserByName(channel)

        if (!raideeUser) {
            logger.warn('Could not retrieve raid user data')
            return
        } else if (!channelUser) {
            logger.warn('Could not retrieve channel user data')
            return
        }

        // shoutout raider
        this.apiClient.chat.shoutoutUser(channelUser, raideeUser)
    }

    private async handleMessage(
        channel: string,
        user: string,
        text: string,
        msg: ChatMessage,
    ) {
        logger.info(`${user}: ${text}`)
        if (text === '!test') {
            this.chatClient.say(
                channel,
                'this is a test from the automated bot system',
            )
            return
        } else if (text === '!game' || text === '!title') {
            if (!msg.channelId) {
                // log an error
                return
            }
            const channelInfo =
                await this.apiClient.channels.getChannelInfoById(msg.channelId)
            if (!channelInfo) {
                return
            }

            this.chatClient.say(
                channel,
                text.includes('game')
                    ? `@${msg.userInfo.displayName}, game: ${channelInfo.gameName}`
                    : `@${msg.userInfo.displayName}, title: ${channelInfo.title}`,
            )
        } else if (text === '!roulette') {
            const val = Math.floor(Math.random() * 7)
            if (val === 1) {
                this.chatClient.say(channel, 'you got hit!')
            } else {
                this.chatClient.say(channel, "you're safe!")
            }
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
            this.apiClient.moderation.banUser(msg.channelId, {
                duration: 1,
                reason: 'for posting links (temporary)',
                user: msg.userInfo.userId,
            })
        }
    }
}
