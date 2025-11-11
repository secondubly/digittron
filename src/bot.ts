import { AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient, ChatMessage, ChatRaidInfo } from '@twurple/chat'
import { find as findUrl } from 'linkifyjs'
import { ApiClient } from '@twurple/api'
import redis, { SocketTimeoutError } from 'redis'
import logger from './logger.js'
import { readdirSync } from 'fs'
import { Command, TokenApiResponse } from './types.js'
import { EventSubWsListener } from '@twurple/eventsub-ws'
import {
    EventSubChannelModerationEvent,
    EventSubChannelRaidModerationEvent,
} from '@twurple/eventsub-base'
import { EventSubHttpListener } from '@twurple/eventsub-http'
import { NgrokAdapter } from '@twurple/eventsub-ngrok'

const redisClient = await redis
    .createClient({
        socket: {
            host:
                process.env.NODE_ENV === 'development'
                    ? 'localhost'
                    : process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT ?? '6379'),
            reconnectStrategy: (retries, cause) => {
                if (cause instanceof SocketTimeoutError) {
                    return false
                }

                const maxRetries = 2 // retries 3 times
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

const BOT_SCOPES = [
    'channel:edit:commercial',
    'channel:moderate',
    'chat:read',
    'chat:edit',
    'clips:edit',
    'moderator:manage:announcements',
    'moderator:manage:banned_users',
    'moderator:manage:blocked_terms',
    'moderator:manage:chat_messages',
    'moderator:manage:shoutouts',
    'moderator:manage:unban_requests',
    'moderator:manage:warnings',
    'moderator:read:chat_settings',
    'moderator:read:chatters',
    'moderator:read:followers',
    'moderator:read:moderators',
    'moderator:read:vips',
    'user:bot',
    'user:read:chat',
    'user:write:chat',
]

export class Bot {
    authProvider: RefreshingAuthProvider
    apiClient: ApiClient
    eventSub: EventSubWsListener | EventSubHttpListener
    chatClient: ChatClient
    commands: Map<string, Command>
    cooldownList: Map<string, number>
    permitList: Map<string, NodeJS.Timeout>
    cooldownAmount = 60 * 1000 // 60 seconds
    broadcasterID: string
    botID: string
    prefix: string

    private constructor(
        chatClient: ChatClient,
        authProvider: RefreshingAuthProvider,
        apiClient: ApiClient,
        eventSub: EventSubHttpListener | EventSubWsListener,
    ) {
        this.chatClient = chatClient
        this.authProvider = authProvider
        this.apiClient = apiClient
        this.commands = new Map()
        this.cooldownList = new Map()
        this.permitList = new Map()
        this.broadcasterID = process.env.TWITCH_ID ?? ''
        this.botID = process.env.BOT_ID ?? ''
        this.prefix = '!'
        this.eventSub = eventSub

        authProvider.onRefresh(this.handleRefresh)

        // handles incoming raids (e.g. people who raid me)
        this.chatClient.onRaid(this.handleIncomingRaid)
        this.chatClient.onMessage(
            (channel: string, user: string, text: string, msg: ChatMessage) => {
                this.handleMessage(channel, user, text, msg)
            },
        )

        this.chatClient.onAuthenticationSuccess(() => {
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

        this.chatClient.connect()
        try {
            this.eventSub.onChannelModerate(
                this.broadcasterID,
                this.botID,
                this.handleOutgoingRaid,
            )
            this.eventSub.start()
        } catch (e) {
            console.error(e)
        }
    }

    static async init(clientID: string, clientSecret: string): Promise<Bot> {
        const authProvider = new RefreshingAuthProvider({
            clientId: clientID,
            clientSecret,
        })

        const botTokenString = await redisClient.get(process.env.BOT_ID!)
        let botAccessToken: AccessToken | undefined =
            botTokenString !== null
                ? (JSON.parse(botTokenString) as AccessToken)
                : undefined
        if (!botAccessToken) {
            try {
                logger.info(
                    'Bot access token not found in cache, checking database...',
                )
                const url = `http://localhost:8080/api/token?${new URLSearchParams(
                    {
                        id: process.env.BOT_ID || '',
                        scopes: BOT_SCOPES,
                    },
                )}`

                const response = await fetch(url)
                if (!response.ok) {
                    throw Error(
                        'Bot access token not found in cache or database.',
                    )
                }

                const { token } = (await response.json()) as TokenApiResponse
                botAccessToken = token
                redisClient.set(
                    process.env.BOT_ID || '',
                    JSON.stringify(botAccessToken),
                )
            } catch (error) {
                logger.error(error)
                process.exit(1)
            }
        }

        logger.debug(
            `Bot Access Token: ${botAccessToken.accessToken} expires in ${botAccessToken.expiresIn}`,
        )

        const broadcasterTokenString = await redisClient.get(
            process.env.TWITCH_ID!,
        )
        let broadcasterAccessToken =
            broadcasterTokenString !== null
                ? (JSON.parse(broadcasterTokenString) as AccessToken)
                : undefined
        if (!broadcasterAccessToken) {
            try {
                logger.info(
                    'Broadcaster access token not found in cache, checking database...',
                )
                const params = new URLSearchParams({
                    id: process.env.TWITCH_ID || '',
                    scopes: BOT_SCOPES,
                }).toString()

                const response = await fetch(
                    `http://localhost:8080/api/token?${params}`,
                )
                if (!response.ok) {
                    throw new Error(
                        'Broadcaster access token not found in cache or database',
                    )
                }

                const { token } = (await response.json()) as TokenApiResponse
                broadcasterAccessToken = token
                redisClient.set(
                    process.env.TWITCH_ID!,
                    JSON.stringify(broadcasterAccessToken),
                )
            } catch (error) {
                logger.error(error)
                process.exit(1)
            }
        }

        logger.debug(
            `Broadcaster Access Token: ${broadcasterAccessToken.accessToken} expires in ${broadcasterAccessToken.expiresIn}`,
        )

        await authProvider.addUser(
            parseInt(process.env.BOT_ID!),
            botAccessToken,
            ['chat'],
        )

        await authProvider.addUser(
            parseInt(process.env.TWITCH_ID!),
            broadcasterAccessToken,
        )

        // TODO: move channels array to env file
        const chatClient = new ChatClient({
            authProvider,
            channels: ['secondubly'],
        })

        const apiClient = new ApiClient({
            authProvider,
        })

        await apiClient.eventSub.deleteAllSubscriptions()

        const eventSub =
            process.env.NODE_ENV === 'production'
                ? new EventSubWsListener({
                      apiClient: apiClient,
                      logger: { minLevel: 'info' },
                  })
                : new EventSubHttpListener({
                      apiClient: apiClient,
                      adapter: new NgrokAdapter({
                          ngrokConfig: {
                              authtoken: process.env.NGROK_AUTH_TOKEN ?? '',
                          },
                      }),
                      logger: { minLevel: 'debug' },
                      secret:
                          process.env.EVENTSUB_SECRET ??
                          'thisShouldBeARandomlyGeneratedFixedString',
                  })

        return new Bot(chatClient, authProvider, apiClient, eventSub)
    }

    private async handleRefresh(userId: string, newTokenData: AccessToken) {
        try {
            redisClient.set(userId, JSON.stringify(newTokenData)).then(() => {
                logger.info(
                    `token refreshed for ${userId === process.env.BOT_ID ? 'bot' : 'broadcaster'}`,
                )
            })
        } catch (error) {
            logger.error((error as Error).message)
        }
    }

    private async handleIncomingRaid(
        channel: string,
        _user: string,
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

    private async handleOutgoingRaid(event: EventSubChannelModerationEvent) {
        if (!(event instanceof EventSubChannelRaidModerationEvent)) {
            return
        }

        const raidedChannel = event.userDisplayName
        const messages = [
            `We're raiding @${raidedChannel}!`,
            `Use this as the raid message: second15RAID second15RAID second15RAID 01010010 01000001 01001001 01000100 00100001 00100001 00100001 second15RAID second15RAID second15RAID`,
        ]

        for (const message of messages) {
            this.chatClient.say(this.broadcasterID, message)
        }
    }

    private async handleMessage(
        channel: string,
        user: string,
        text: string,
        msg: ChatMessage,
    ) {
        if (!msg.channelId) {
            logger.error('message does not contain a channel id.')
            return
        }

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
                    this.cooldownList.has(command.name) &&
                    !msg.userInfo.isBroadcaster &&
                    !msg.userInfo.isMod
                ) {
                    const expirationTime =
                        this.cooldownList.get(command.name)! +
                        this.cooldownAmount

                    if (now < expirationTime) {
                        logger.warn(
                            `${msg.userInfo.displayName} tried to execute ${command.name} too early.`,
                        )
                        return // still on cooldown
                    } else {
                        // remove from cooldown list
                        this.cooldownList.delete(command.name)
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
                }
                if (command.name.toLocaleLowerCase() === 'permit') {
                    // if username provided
                    if (args.length > 0) {
                        // do permit ahead of time
                        const username = args[0]
                        const permitId = setTimeout(() => {
                            this.permitList.delete(username)
                            logger.info(`Removed ${username} from permit list`)
                        }, 60000)
                        this.permitList.set(username, permitId)
                        command.execute(
                            this.chatClient,
                            channel,
                            msg,
                            args,
                            this.apiClient,
                        )
                    }
                } else {
                    command.execute(
                        this.chatClient,
                        channel,
                        msg,
                        args,
                        this.apiClient,
                    )
                }

                this.cooldownList.set(command.name, now)
            } catch (error) {
                logger.error(error)
            }
        } else if (findUrl(text).length > 0) {
            if (
                msg.userInfo.isBroadcaster ||
                msg.userInfo.isMod ||
                msg.userInfo.userId === this.botID
            ) {
                return
            }

            // timeout users who post links
            this.apiClient.moderation.banUser(msg.channelId, {
                duration: 1,
                reason: 'for posting links (temporary)',
                user: msg.userInfo.userId,
            })
        } else {
            logger.info(`${user}: ${text}`)
        }
    }
}
