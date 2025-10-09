import { AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient, ChatMessage, ChatRaidInfo } from '@twurple/chat'
import { find as findUrl } from 'linkifyjs'
import { ApiClient } from '@twurple/api'
import redis, { SocketTimeoutError } from 'redis'
import logger from './logger.js'
import { readdirSync } from 'fs'
import { Command } from './types.js'
import { getToken } from './lib/utils/token.js'

const redisClient = await redis
    .createClient({
        socket: {
            host: process.env.REDIS_HOST ?? 'localhost',
            port: parseInt(process.env.REDIS_PORT ?? '6379'),
            reconnectStrategy: (retries, cause) => {
                if (cause instanceof SocketTimeoutError) {
                    return false
                }

                const maxRetries = 999999999 // retries 3 times
                if (retries > maxRetries) {
                    logger.error('Too many retries. Connection terminated.')
                    return new Error('Too many retries.')
                }

                // Generate a random jitter between 0 – 200 ms:
                const jitter = Math.floor(Math.random() * 200)
                // Delay is an exponential back off, (times^2) * 50 ms, with a maximum value of 2000 ms:
                const delay = Math.min(Math.pow(2, retries) * 50, 2000)

                logger.warn(
                    `Retrying connection in ${delay / 1000} seconds (Attempt ${retries + 1} of ${maxRetries + 1})...`,
                )
                return delay + jitter
            },
        },
    })
    .on('connect', () => logger.info('connected to redis'))
    .on('error', (err) => logger.error('Redis Client Error', err))
    .connect()

export class Bot {
    authProvider: RefreshingAuthProvider
    apiClient: ApiClient
    chatClient: ChatClient
    commands: Map<string, Command>
    cooldown: Map<string, number>
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
        this.cooldown = new Map()
        this.prefix = '!'

        authProvider.onRefresh(this.handleRefresh)

        this.chatClient.onRaid(this.handleRaid)
        this.chatClient.onMessage(
            (channel: string, user: string, text: string, msg: ChatMessage) => {
                this.handleMessage(channel, user, text, msg)
            },
        )

        chatClient.onAuthenticationSuccess(() => {
            logger.info("I've successfully connected!")
            const commandFiles = readdirSync('./build/commands').filter(
                (file) => file.endsWith('.js'),
            )
            logger.info(`Loading ${commandFiles.length} commands.`)

            commandFiles.forEach(async (file) => {
                const module = await import(`./commands/${file} `)
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

        let botTokenString = await redisClient.get(process.env.BOT_ID!)
        if (!botTokenString) {
            try {
                const botScopes = [
                    'chat:edit',
                    'chat:read',
                    'user:bot',
                    'user:read:chat',
                    'user:write:chat',
                ]
                botTokenString = await getToken(process.env.BOT_ID!, botScopes)
                if (!botTokenString) {
                    throw Error(
                        'Bot access token not found in cache or database.',
                    )
                }

                redisClient.set(process.env.BOT_ID!, botTokenString)
            } catch (error) {
                logger.error(error)
                process.exit(1)
            }
        }

        const botAccessToken = JSON.parse(botTokenString) as AccessToken

        let channelTokenString = await redisClient.get(process.env.TWITCH_ID!)
        if (!channelTokenString) {
            try {
                channelTokenString = await getToken(process.env.TWITCH_ID!)
                if (!channelTokenString) {
                    throw Error(
                        'Bot access token not found in cache or database.',
                    )
                }

                redisClient.set(process.env.TWITCH_ID!, channelTokenString)
            } catch (error) {
                logger.error(error)
                process.exit(1)
            }
        }
        const channelTokenData = JSON.parse(channelTokenString) as AccessToken

        await authProvider.addUserForToken(botAccessToken, ['chat'])
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
        if (text.startsWith(this.prefix)) {
            const message = text.substring(this.prefix.length)
            const [name, ...args] = message.split(' ')

            const command =
                this.commands.get(name) ||
                this.commands
                    .values()
                    .find((cmd) => cmd.aliases && cmd.aliases.includes(name))
            if (!command || !command.enabled) return

            try {
                const now = Date.now()
                if (
                    (!msg.userInfo.isBroadcaster || !msg.userInfo.isMod) &&
                    this.cooldown.has(command.name)
                ) {
                    const expirationTime =
                        this.cooldown.get(command.name)! + this.cooldownAmount

                    if (now < expirationTime) {
                        logger.warn(
                            `${msg.userInfo.displayName} tried to execute ${command.name} too early.`,
                        )
                        return // still on cooldown
                    } else {
                        // remove from cooldown list
                        this.cooldown.delete(command.name)
                    }
                }

                // TODO: clean this up
                if (command.name.toLocaleLowerCase() === 'commands') {
                    // remove disabled commands and the !commands command (it's redundant)
                    const commandNames = [...this.commands]
                        .filter(
                            ([name, command]) =>
                                command.enabled && name !== 'commands',
                        )
                        .map(([name, _command]) => name)
                    command.execute(
                        this.chatClient,
                        channel,
                        msg,
                        commandNames,
                        this.apiClient,
                    )
                } else {
                    command.execute(
                        this.chatClient,
                        channel,
                        msg,
                        args,
                        this.apiClient,
                    )
                }

                this.cooldown.set(command.name, now)
            } catch (error) {
                logger.error(error)
            }
        } else if (findUrl(text).length > 0) {
            if (
                msg.userInfo.isBroadcaster ||
                msg.userInfo.isMod ||
                msg.userInfo.userId === process.env.BOT_ID
            ) {
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
