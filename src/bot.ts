import { AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient, ChatMessage, ChatRaidInfo } from '@twurple/chat'
import { find as findUrl } from 'linkifyjs'
import { ApiClient } from '@twurple/api'
import redis from 'redis'
import logger from './logger.js'
import Enmap from 'enmap'
import { readdirSync } from 'fs'
import { Command } from './types.js'

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
    commands: Map<string, Command>
    cooldown: Enmap<string, number>
    cooldownAmount = 60 * 1000 // 60 seconds
    prefix: string

    private constructor(
        chatClient: ChatClient,
        authProvider: RefreshingAuthProvider,
        apiClient: ApiClient,
    ) {
        this.chatClient = chatClient
        this.authProvider = authProvider
        this.apiClient = apiClient
        this.commands = new Map()
        this.cooldown = new Enmap({ name: 'cooldowns' })
        this.prefix = "!"

        authProvider.onRefresh(this.handleRefresh)

        this.chatClient.onRaid(this.handleRaid)
        this.chatClient.onMessage((channel: string, user: string, text: string, msg: ChatMessage) => {
            this.handleMessage(channel, user, text, msg)
        })

        chatClient.onAuthenticationSuccess(() => {
            logger.info("I've successfully connected!")
            const commandFiles = readdirSync('./build/commands')
                .filter((file) => file.endsWith('.js'))
            logger.info(`Loading ${commandFiles.length} commands.`)

            commandFiles.forEach(async (file) => {
                const module = await import(`./commands/${file}`)
                const command = module.default
                this.commands.set(command.name, command)
            })
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

        if (text.startsWith(this.prefix)) {
            const message = text.substring(this.prefix.length)
            const [name, ...args] = message.split(' ')

            const command = this.commands.get(name) || this.commands.values().find((cmd) => cmd.aliases && cmd.aliases.includes(name))
            if (!command) return

            try {
                const now = Date.now()
                if ((!msg.userInfo.isBroadcaster || !msg.userInfo.isMod) && this.cooldown.has(command.name)) {
                    const expirationTime = this.cooldown.get(command.name)! + this.cooldownAmount

                    if (now < expirationTime) {
                        logger.warn(`${msg.userInfo.displayName} tried to execute ${command.name} too early.`)
                        return // still on cooldown
                    } else {
                        // remove from cooldown list
                        this.cooldown.delete(command.name)
                    }
                }

                command.execute(this.chatClient, channel, msg, args, this.apiClient)
                this.cooldown.set(command.name, now)

            } catch (error) {
                logger.error(error)
            }
        } else if (findUrl(text).length > 0) {
            if (msg.userInfo.isBroadcaster || msg.userInfo.isMod) {
                return
            }

            if (!msg.channelId) {
                // log an error
                return
            }

            // timeout users who post links
            this.apiClient.moderation.banUser(msg.channelId, {
                duration: 1,
                reason: 'for posting links (temporary)',
                user: msg.userInfo.userId,
            })
        }
    }
}
