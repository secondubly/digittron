import { RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient } from '@twurple/chat'
import { ApiClient } from '@twurple/api'
import { EventSubWsListener } from '@twurple/eventsub-ws'
import { EventSubHttpListener } from '@twurple/eventsub-http'
import { NgrokAdapter } from '@twurple/eventsub-ngrok'
import type { BotConfig } from '@lib/config/bot'
import { CommandRegistry } from '@lib/bot/CommandRegistry'
import path from 'path'
import { EventRegistry } from '@lib/bot/EventRegistry'

const config: BotConfig = {
    broadcasterId: process.env.TWITCH_BROADCASTER_ID ?? '',
    botId: process.env.TWITCH_BOT_ID ?? '',
}

export class Bot {
    private chatClient?: ChatClient
    private apiClient?: ApiClient
    private eventSub?: EventSubHttpListener | EventSubWsListener
    private readonly channels: string[]
    private readonly commandRegistry: CommandRegistry
    private readonly eventRegistry: EventRegistry
    private botId: string
    private sessionChatters: Set<string> = new Set()
    // TODO: set audio alerts and such again
    // private audioAlertUsers = new Set(['89181064', '537326154']) // remove 89181064 after testing
    // private permitList = new Map<string, NodeJS.Timeout>()

    constructor(authProvider: RefreshingAuthProvider, channels: string[]) {
        this.channels = channels
        this.botId = config.botId
        config.channelName = channels[0]
        this.commandRegistry = new CommandRegistry('!')
        this.eventRegistry = new EventRegistry()
        this.initializeClients(authProvider)
    }

    private initializeClients(authProvider: RefreshingAuthProvider) {
        this.chatClient = new ChatClient({
            authProvider,
            channels: this.channels,
        })

        this.apiClient = new ApiClient({
            authProvider,
        })

        if (process.env.NODE_ENV === 'development') {
            this.eventSub = new EventSubHttpListener({
                apiClient: this.apiClient,
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
        } else {
            this.eventSub = new EventSubWsListener({
                apiClient: this.apiClient,
                logger: { minLevel: 'info' },
            })
        }
    }

    public async start(): Promise<void> {
        await this.commandRegistry.loadCommands(
            path.join(import.meta.dirname, 'commands'),
        )

        await this.eventRegistry.loadEvents(
            path.join(import.meta.dirname, 'events'),
            { registry: this.commandRegistry },
        )

        await this.apiClient?.eventSub.deleteAllSubscriptions()

        await this.chatClient?.connect()
        await this.eventSub?.start()

        await this.eventRegistry.registerAll({
            apiClient: this.apiClient!,
            chatClient: this.chatClient!,
            eventSub: this.eventSub!,
            broadcasterId: config.broadcasterId,
            botUserId: this.botId,
        })
    }

    public async stop(): Promise<void> {
        await this.eventSub?.stop()
        await this.chatClient?.quit()
    }
}
