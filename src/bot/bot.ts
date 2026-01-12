import { type AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient } from '@twurple/chat'
import { find as findUrl } from 'linkifyjs'
import { log } from '@lib/utils/logger.js'
import { ApiClient, HelixUser } from '@twurple/api'
import redisClient from '@lib/utils/redis.js'
import { readdirSync } from 'fs'
import { type Command } from '@lib/bot/types.js'
import { EventSubWsListener } from '@twurple/eventsub-ws'
import {
    EventSubChannelChatMessageEvent,
    type EventSubChannelModerationEvent,
    EventSubChannelRaidEvent,
    EventSubChannelRaidModerationEvent,
} from '@twurple/eventsub-base'
import { EventSubHttpListener } from '@twurple/eventsub-http'
import { NgrokAdapter } from '@twurple/eventsub-ngrok'
import { getToken, playAudio } from '@lib/utils/utils.js'

export class Bot {
    authProvider: RefreshingAuthProvider
    audioAlertUsers: Map<string, string>
    apiClient: ApiClient
    botID: string
    broadcasterID: string
    chatClient: ChatClient
    commands: Map<string, Command>
    cooldownAmount = 60 * 1000 // 60 seconds
    cooldownList: Map<string, number>
    eventSub: EventSubWsListener | EventSubHttpListener
    hasSpoken: Set<string>
    permitList: Map<string, NodeJS.Timeout>
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
        this.audioAlertUsers = new Map()
        this.cooldownList = new Map()
        this.permitList = new Map()
        this.broadcasterID = process.env.TWITCH_ID ?? ''
        this.botID = process.env.BOT_ID ?? ''
        this.prefix = '!'
        this.eventSub = eventSub
        this.hasSpoken = new Set()

        /** setup event handlers */
        authProvider.onRefresh(this.handleRefresh)

        this.chatClient.onAuthenticationSuccess(() => {
            let commandFiles: string[]
            if (process.env.NODE_ENV === 'development') {
                commandFiles = readdirSync('./src/bot/commands').filter(
                    (file) => file.endsWith('.ts'),
                )
            } else {
                commandFiles = readdirSync('./build/bot/commands').filter(
                    (file) => file.endsWith('.js'),
                )
            }
            log.bot.info(`Loaded ${commandFiles.length} commands.`)
            Promise.all(
                commandFiles.map((file) => {
                    return import(`./commands/${file}`)
                }),
            )
                .then((commands) => {
                    commands.forEach((command) => {
                        const commandName = command.default.name
                        this.commands.set(commandName, command.default)
                    })
                })
                .catch((error) => {
                    log.bot.error(
                        `Error when building command map: ${(error as Error).message}`,
                    )
                })
        })

        this.eventSub.onChannelModerate(
            this.broadcasterID,
            this.botID,
            this.handleOutgoingRaid.bind(this),
        )

        this.eventSub.onChannelChatMessage(
            this.broadcasterID,
            this.botID,
            this.handleMessage.bind(this),
        )

        this.eventSub.onChannelRaidTo(this.broadcasterID, this.handleIncomingRaid)


        this.eventSub.start()

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
            log.bot.info(
                'Bot access token not found in cache, checking database...',
            )
            botAccessToken = await getToken('bot')
            if (!botAccessToken) {
                throw new ReferenceError(
                    'Bot access token not found in cache or database.',
                )
            }
        }

        log.bot.debug(
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
            log.bot.info(
                'Broadcaster access token not found in cache, checking database...',
            )

            broadcasterAccessToken = await getToken('user')
        }

        log.bot.debug(
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
            log.bot.info(
                `Connected to ${twitchChannels.length} ${twitchChannels.length === 1 ? 'channel' : 'channels'}: ${twitchChannels.join(', ')}`,
            )
        })

        chatClient.onDisconnect((graceful) => {
            log.bot.info(
                `I\'ve been ${graceful ? 'gracefully' : 'forcibly'} disconnected!`,
            )
        })

        const apiClient = new ApiClient({
            authProvider,
        })

        await apiClient.eventSub.deleteAllSubscriptions()

        const eventSub =
            process.env.NODE_ENV === 'development'
                ? new EventSubHttpListener({
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
                : new EventSubWsListener({
                    apiClient: apiClient,
                    logger: { minLevel: 'info' },
                })

        return new Bot(chatClient, authProvider, apiClient, eventSub)
    }

    private async handleRefresh(userId: string, newTokenData: AccessToken) {
        await redisClient.set(userId, JSON.stringify(newTokenData))
        log.bot.info(
            `Token refreshed for ${userId === process.env.BOT_ID ? 'bot' : 'broadcaster'}`,
        )
        log.bot.debug(`Token Info: ${JSON.stringify(newTokenData)})`)
    }

    private async handleIncomingRaid(
        event: EventSubChannelRaidEvent
    ) {
        // get game info for raidingUser
        const channelInfo = await this.apiClient.channels.getChannelInfoById(event.raidingBroadcasterId)
        if (!channelInfo) {
            log.bot.warn('Could not retrieve channel info for raider')
            return
        }

        const gameInfo = await channelInfo.getGame()
        if (!gameInfo) {
            log.bot.warn('Could not get game info for raider')
            return
        }

        // shoutout raider
        await this.apiClient.asUser(this.botID, async (ctx) => {
            await ctx.chat.shoutoutUser(this.botID, event.raidingBroadcasterId)
        })

        const raidMsg = `Everyone say hi to ${event.raidingBroadcasterDisplayName}! They were playing ${gameInfo.name}!`
        this.apiClient.chat.sendChatMessageAsApp(this.botID, this.broadcasterID, raidMsg)
    }

    private async handleOutgoingRaid(event: EventSubChannelModerationEvent) {
        if (!(event instanceof EventSubChannelRaidModerationEvent)) {
            return
        }

        const raidedChannel = event.userDisplayName
        const messages = [
            `We're raiding @${raidedChannel}!`,
            `Use this as the raid message: second15Raid 01010010 01000001 01001001 01000100 00100001 00100001 00100001 second15Raid`,
        ]

        for (const message of messages) {
            await this.apiClient.chat.sendChatMessageAsApp(
                this.botID,
                this.broadcasterID,
                message,
            )
            // wait a bit before sending the next message
            await new Promise((resolve) => setTimeout(resolve, 1500))
        }
    }

    // TODO: send automated messages every X minutes
    // private async sendAutoMessage() {}

    private async handleCommands(
        message: string,
        event: EventSubChannelChatMessageEvent,
        authorInfo: HelixUser,
        isBroadcaster: boolean,
        isMod: boolean,
    ) {
        message = message.substring(this.prefix.length)
        const [name, ...args] = message.split(' ')

        let command
        if (this.commands.has(name)) {
            command = this.commands.get(name)
        } else {
            const commandsArray = [...this.commands.values()]
            command = commandsArray.find(
                (cmd) => cmd.aliases && cmd.aliases.includes(name),
            )
        }

        if (!command || command.enabled === false) return

        // check if command is still in cooldown
        const now = Date.now()
        if (this.cooldownList.has(command.name) && !isBroadcaster && !isMod) {
            const expirationTime =
                this.cooldownList.get(command.name)! + this.cooldownAmount

            if (now < expirationTime) {
                log.bot.warn(
                    `${authorInfo.displayName} tried to execute ${command.name} too early.`,
                )
                return
            } else {
                this.cooldownList.delete(command.name)
            }
        }

        switch (command.name.toLocaleLowerCase()) {
            case 'commands':
                const commandNames = [...this.commands]
                    .filter(
                        ([name, command]) =>
                            command.enabled && name !== 'commands',
                    )
                    .map(([name, _command]) => name)
                command.execute(event, commandNames, this.apiClient)
                break
            case 'permit':
                // add to permit list ahead of time
                const username = args[0]
                const permitId = setTimeout(() => {
                    this.permitList.delete(username)
                    log.bot.info(`Removed ${username} from permit list`)
                }, 60000)
                this.permitList.set(username, permitId)
                command.execute(event, args, this.apiClient)
                break
            case 'details':
                const appAccessToken = await (
                    await this.authProvider.getAppAccessToken()
                ).accessToken
                args.push(appAccessToken)
                command.execute(event, args, this.apiClient) // repeated
                break
            default:
                command.execute(event, args, this.apiClient)
                break
        }

        // add command to cooldown list
        this.cooldownList.set(command.name, now)
    }

    private async handleMessage(event: EventSubChannelChatMessageEvent) {
        const authorInfo = await event.getChatter()
        const isBroadcaster = event.chatterId === this.broadcasterID
        const isMod = await this.apiClient.moderation.checkUserMod(
            this.broadcasterID,
            event.chatterId,
        )
        const isBot = event.chatterId === this.botID
        const channelInfo = await this.apiClient.channels.getChannelInfoById(
            event.broadcasterId,
        )

        if (!channelInfo) {
            log.bot.warn(
                `Could not find channel info for broadcaster ${event.broadcasterId}`,
            )
        }

        if (!this.hasSpoken.has(authorInfo.id)) {
            this.hasSpoken.add(authorInfo.id)
            if (this.audioAlertUsers.has(authorInfo.id)) {
                log.bot.info(`Sending playAudio event for ${authorInfo.displayName} (${authorInfo.id})`)
                playAudio(authorInfo.id)
            }
        }

        const message = event.messageText
        if (event.messageText.startsWith(this.prefix)) {
            this.handleCommands(
                message,
                event,
                authorInfo,
                isBroadcaster,
                isBot,
            )
        } else if (findUrl(event.messageText).length > 0) {
            if (isBroadcaster || isMod || isBot) {
                return
            }

            // timeout users who post links
            await this.apiClient.asUser(this.botID, async (ctx) => {
                await ctx.moderation.banUser(this.broadcasterID, {
                    duration: 1,
                    reason: 'for posting links (temporary)',
                    user: authorInfo.id,
                })
            })

            this.apiClient.chat.sendChatMessageAsApp(
                this.botID,
                this.broadcasterID,
                `${authorInfo.displayName}, please refrain from posting links!
                If you want to post a link, ask a mod or the streamer to permit you.`,
            )
        } else {
            log.bot.info(`${authorInfo.displayName}: ${message}`)
        }
    }
}
