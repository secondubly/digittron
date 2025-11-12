import { AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient, ChatMessage, ChatRaidInfo } from '@twurple/chat'
import { find as findUrl } from 'linkifyjs'
import { ApiClient } from '@twurple/api'
import redisClient from './lib/utils/redis.js'
import logger from './logger.js'
import { readdirSync } from 'fs'
import { Command } from './types.js'
import { EventSubWsListener } from '@twurple/eventsub-ws'
import {
    EventSubChannelModerationEvent,
    EventSubChannelRaidModerationEvent,
} from '@twurple/eventsub-base'
import { EventSubHttpListener } from '@twurple/eventsub-http'
import { NgrokAdapter } from '@twurple/eventsub-ngrok'
import getToken from './lib/utils/utils.js'

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

        /** setup event handlers */
        authProvider.onRefresh(this.handleRefresh)

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

        this.chatClient.connect()
    }

    static async init(clientID: string, clientSecret: string): Promise<Bot> {
        const authProvider = new RefreshingAuthProvider({
            clientId: clientID,
            clientSecret,
        })

        const botTokenString = await redisClient.get(process.env.BOT_ID!)
        let botAccessToken: AccessToken | null =
            botTokenString !== null
                ? (JSON.parse(botTokenString) as AccessToken)
                : null
        if (!botAccessToken) {
            try {
                logger.info(
                    'Bot access token not found in cache, checking database...',
                )
                botAccessToken = await getToken('bot')
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
                : null
        if (!broadcasterAccessToken) {
            logger.info(
                'Broadcaster access token not found in cache, checking database...',
            )

            broadcasterAccessToken = await getToken('user')
        }

        logger.debug(
            `Broadcaster Access Token: ${broadcasterAccessToken.accessToken} expires in ${broadcasterAccessToken.expiresIn}`,
        )

        /**
         * add users to auth provider
         */
        await authProvider.addUser(
            parseInt(process.env.BOT_ID!),
            botAccessToken,
            ['chat'],
        )

        await authProvider.addUser(
            parseInt(process.env.TWITCH_ID!),
            broadcasterAccessToken,
        )

        const twitchChannels = process.env.CHANNELS
            ? process.env.CHANNELS.split(',').map((channel) => channel.trim())
            : []

        /**
         * setup clients and eventsub
         */
        const chatClient = new ChatClient({
            authProvider,
            channels: twitchChannels,
        })

        chatClient.onConnect(() => {
            logger.info(
                `connected to ${twitchChannels.length} channels: ${twitchChannels.join(', ')}`,
            )
        })

        chatClient.onDisconnect((graceful) => {
            if (!graceful) {
                logger.warn("I've been forcibly disconnected!")
            }
            logger.info(
                `I\'ve been ${graceful ? 'gracefully' : 'forcibly'} disconnected!`,
            )
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
