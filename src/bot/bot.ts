import { RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient } from '@twurple/chat'
import { ApiClient } from '@twurple/api'
import { EventSubWsListener } from '@twurple/eventsub-ws'
import { EventSubHttpListener } from '@twurple/eventsub-http'
import { NgrokAdapter } from '@twurple/eventsub-ngrok'
import { CommandRegistry } from '@lib/bot/CommandRegistry'
import path from 'path'
import { EventRegistry } from '@lib/bot/EventRegistry'
import { log } from '@lib/services/logger'
import { config as envConfig } from 'src/config/env'
import { TokenStore } from '@lib/core/tokens/TokenStore'
import { createAuthProvider } from '@lib/core/tokens/TokenAdapter'
import { TokenValidator } from '@lib/core/tokens/TokenValidator'

export class Bot {
    private chatClient?: ChatClient
    private apiClient?: ApiClient
    private eventSub?: EventSubHttpListener | EventSubWsListener
    private readonly channels: string[]
    private readonly commandRegistry: CommandRegistry
    private readonly eventRegistry: EventRegistry
    private readonly validator: TokenValidator
    private botId: string
    private sessionChatters: Set<string> = new Set()
    private scheduledTimer: NodeJS.Timeout | null = null
    private pollInterval: NodeJS.Timeout | null = null

    // TODO: set audio alerts and such again
    private audioAlertUsers = new Set(['89181064', '537326154']) // remove 89181064 after testing

    constructor(
        channels: string[],
        private readonly tokenStore: TokenStore,
    ) {
        this.channels = channels
        this.botId = envConfig.TWITCH_BOT_ID
        this.validator = new TokenValidator(tokenStore)
        this.commandRegistry = new CommandRegistry('!')
        this.eventRegistry = new EventRegistry()
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

    public startAdPoller() {
        if (this.pollInterval) {
            log.bot.warn('Ad polling already started, skipping start call.')
            return
        }

        log.bot.info('Starting ad poller')
        this.poll()
        this.pollInterval = setInterval(
            () => this.poll,
            envConfig.POLL_INTERVAL_MS,
        )
    }

    public stopAdPoller() {
        if (this.pollInterval) clearInterval(this.pollInterval)
        if (this.scheduledTimer) clearInterval(this.scheduledTimer)

        this.pollInterval = null
        this.scheduledTimer = null
    }

    public addFirstTimeChatter(userId: string) {
        log.bot.warn(
            `First message from ${userId} during stream, adding to list...`,
        )
        if (this.sessionChatters.has(userId)) {
            return
        } else {
            this.sessionChatters.add(userId)

            if (this.audioAlertUsers.has(userId)) {
                this.playAudio(userId)
            }
        }
    }

    public clearFirstTimeChatters() {
        this.sessionChatters.clear()
    }

    private async playAudio(userId: string): Promise<void> {
        const url = `http://localhost:4000/api/audio/${userId}`
        const response = await fetch(url)

        if (!response.ok) {
            log.app.error(`Could not play audio file for twitch id: ${userId}`)
            return
        }
    }

    // if the bot restarts mid-stream, we don't want to miss any ads, so start polling again
    private async checkInitialStreamState(): Promise<void> {
        try {
            const stream = await this.apiClient?.streams.getStreamByUserId(
                envConfig.TWITCH_BROADCASTER_ID,
            )

            if (stream) {
                log.bot.info(
                    'Stream already live on startup — starting ad poller.',
                )
                this.startAdPoller()
            } else {
                log.bot.info(
                    'Stream offline on startup — ad poller standing by.',
                )
            }
        } catch (err) {
            log.bot.error({ err }, 'Failed to check initial stream state')
        }
    }

    private async poll() {
        try {
            const schedule = await this.apiClient?.channels.getAdSchedule(
                envConfig.TWITCH_BROADCASTER_ID,
            )

            if (!schedule || schedule.nextAdDate) {
                log.bot.info('No upcoming ad scheduled')
                return
            }

            log.bot.info(
                `Next ad at: ${schedule.nextAdDate} | duration: ${schedule.duration}s`,
            )
            this.scheduleWarning(schedule.nextAdDate!, schedule.duration)
        } catch (err) {
            log.bot.error(`Poll error: ${err}`)
        }
    }

    async scheduleWarning(nextAdAt: Date, durationSeconds: number) {
        if (this.scheduledTimer) clearTimeout(this.scheduledTimer)

        const delayMs =
            new Date(nextAdAt).getTime() - Date.now() - envConfig.LEAD_TIME_MS

        if (delayMs <= 0) {
            log.bot.info('Ad is imminent or passed, skipping warning.')
            return
        }

        log.bot.info(`Warning scheduled in ${Math.round(delayMs / 1000)}s`)

        this.scheduledTimer = setTimeout(() => {
            this.onAdWarning(nextAdAt, durationSeconds)
        }, delayMs)
    }

    private async onAdWarning(nextAdAt: Date, durationSeconds: number) {
        // we need to use valueOf so TS doesn't complain about arithmetic
        const secsUntil = Math.round(
            (new Date(nextAdAt).valueOf() - Date.now()) / 1000,
        )
        const message = `📢 Ad break in ~${secsUntil}s (${durationSeconds}s long). Stretch your legs! PogChamp`

        this.apiClient?.chat
            .sendChatMessageAsApp(
                this.botId,
                envConfig.TWITCH_BROADCASTER_ID,
                message,
            )
            .then(() => log.bot.info(`${message}`))
            .catch((err) => log.bot.error('Chat send failed:', err))
    }

    public async start(): Promise<void> {
        // TODO: fix
        const authProvider = await createAuthProvider(
            envConfig.TWITCH_CLIENT_ID,
            envConfig.TWITCH_CLIENT_SECRET,
            this.tokenStore,
        )

        this.initializeClients(authProvider)

        await this.commandRegistry.loadCommands(
            path.join(import.meta.dirname, 'commands'),
            {
                registry: this.commandRegistry,
                tokenStore: this.tokenStore,
            },
        )

        await this.eventRegistry.loadEvents(
            path.join(import.meta.dirname, 'events'),
            {
                registry: this.commandRegistry,
                bot: this,
                apiClient: this.apiClient,
            },
        )

        await this.apiClient?.eventSub.deleteAllSubscriptions()

        await this.chatClient?.connect()

        await this.eventSub?.start()

        await this.eventRegistry.registerAll({
            chatClient: this.chatClient!,
            eventSub: this.eventSub!,
            broadcasterId: envConfig.TWITCH_BROADCASTER_ID,
            botUserId: this.botId,
        })

        // REVIEW: do we really need to do this if twurple handles key refreshing?
        // this.validator.start(tokenKeys)

        await this.checkInitialStreamState()
    }

    public async stop(): Promise<void> {
        this.stopAdPoller()
        this.clearFirstTimeChatters()
        await this.eventSub?.stop()
        await this.chatClient?.quit()
    }
}
