import { RefreshingAuthProvider } from '@twurple/auth'
import { ChatClient } from '@twurple/chat'
import { ApiClient } from '@twurple/api'
import { EventSubWsListener } from '@twurple/eventsub-ws'
import { EventSubHttpListener } from '@twurple/eventsub-http'
import { NgrokAdapter } from '@twurple/eventsub-ngrok'
import { CommandRegistry } from './services/CommandRegistry'
import path from 'path'
import { EventRegistry } from './services/EventRegistry'
import { log } from '@core/utils/logger'
import { config, config as envConfig } from '@core/config/env'
import { TokenStore } from '@core/tokens/TokenStore'
import { createAuthProvider } from '@core/tokens/TokenAdapter'
import { AuthWaiter } from '@core/tokens/AuthWait'
import type { OauthTokenRecord, TokenKey } from '@core/tokens/types'
import { SpotifyFetcher } from './services/SpotifyFetcher'
import { FirstMessageTracker } from './services/FirstMessageTracker'
import { EventEmitter } from 'events'
import type { CommandDeps } from './types'

export class Bot extends EventEmitter {
  private chatClient?: ChatClient
  private apiClient?: ApiClient
  private eventSub?: EventSubHttpListener | EventSubWsListener
  private spotifyFetcher?: SpotifyFetcher
  private readonly channels: string[]
  readonly commandRegistry: CommandRegistry
  private readonly eventRegistry: EventRegistry
  private readonly authWaiter: AuthWaiter
  readonly firstMessageTracker: FirstMessageTracker
  private botId: string
  private scheduledTimer: NodeJS.Timeout | null = null
  private pollInterval: NodeJS.Timeout | null = null
  private running = false

  constructor(
    channels: string[],
    private readonly tokenStore: TokenStore,
  ) {
    super()
    this.channels = channels
    this.botId = envConfig.TWITCH_BOT_ID
    this.eventRegistry = new EventRegistry()
    this.authWaiter = new AuthWaiter()
    this.firstMessageTracker = new FirstMessageTracker()
    this.commandRegistry = new CommandRegistry('!', this.say.bind(this))
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
      if (!envConfig.NGROK_AUTH_TOKEN || !envConfig.EVENT_SUB_SECRET) {
        log.bot.warn(
          'Missing NGROK_AUTH and/or EVENT_SUB_SECRET keys, the bot might be running in an insecure state.',
        )
      }
      this.eventSub = new EventSubHttpListener({
        apiClient: this.apiClient,
        adapter: new NgrokAdapter({
          ngrokConfig: {
            authtoken: envConfig.NGROK_AUTH_TOKEN ?? 'thisShouldBeARandomlyGeneratedFixedString',
          },
        }),
        logger: { minLevel: 'debug' },
        secret: process.env.EVENTSUB_SECRET ?? 'thisShouldBeARandomlyGeneratedFixedString',
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
    this.pollInterval = setInterval(() => this.poll, envConfig.POLL_INTERVAL_MS)
  }

  public stopAdPoller() {
    if (this.pollInterval) clearInterval(this.pollInterval)
    if (this.scheduledTimer) clearInterval(this.scheduledTimer)

    this.pollInterval = null
    this.scheduledTimer = null
  }

  // if the bot restarts mid-stream, we don't want to miss any ads, so start polling again
  private async checkInitialStreamState(): Promise<void> {
    try {
      const stream = await this.apiClient?.streams.getStreamByUserId(
        envConfig.TWITCH_BROADCASTER_ID,
      )

      if (stream) {
        log.bot.info(
          'Stream already live on startup — starting services (ad poller, first message tracker).',
        )
        this.firstMessageTracker.setOnline()
        this.startAdPoller()
      } else {
        log.bot.info(
          'Stream offline on startup — services (ad poller, first message tracker) standing by.',
        )
        this.firstMessageTracker.setOffline()
      }
    } catch (err) {
      log.bot.error({ err }, 'Failed to check initial stream state')
    }
  }

  private async poll() {
    try {
      const schedule = await this.apiClient?.channels.getAdSchedule(envConfig.TWITCH_BROADCASTER_ID)

      if (!schedule || schedule.nextAdDate) {
        log.bot.info('No upcoming ad scheduled')
        return
      }

      log.bot.info(`Next ad at: ${schedule.nextAdDate} | duration: ${schedule.duration}s`)
      this.scheduleWarning(schedule.nextAdDate!, schedule.duration)
    } catch (err) {
      log.bot.error(`Poll error: ${err}`)
    }
  }

  async scheduleWarning(nextAdAt: Date, durationSeconds: number) {
    if (this.scheduledTimer) clearTimeout(this.scheduledTimer)

    const delayMs = new Date(nextAdAt).getTime() - Date.now() - envConfig.LEAD_TIME_MS

    if (delayMs <= 0) {
      log.bot.info('Ad is imminent or passed, skipping warning.')
      return
    }

    log.bot.info(`Warning scheduled in ${Math.round(delayMs / 1000)}s`)

    this.scheduledTimer = setTimeout(() => {
      this.onAdWarning(nextAdAt, durationSeconds)
    }, delayMs)
  }

  async say(channel: string, message: string): Promise<void> {
    try {
      const broadcasterId = await this.apiClient?.users
        .getUserByName(channel.replace('#', ''))
        .then((u) => u?.id)

      await this.apiClient?.chat.sendChatMessageAsApp(
        this.botId,
        broadcasterId ?? envConfig.TWITCH_BROADCASTER_ID,
        message,
      )
      log.bot.info(`[${channel}] ${message}`)
    } catch (err) {
      log.bot.error({ err }, `Failed to send message to ${channel}`)
    }
  }

  async sayInChannel(message: string): Promise<void> {
    return this.say(envConfig.TWITCH_BROADCASTER_ID, message)
  }

  private async onAdWarning(nextAdAt: Date, durationSeconds: number) {
    // we need to use valueOf so TS doesn't complain about arithmetic
    const secsUntil = Math.round((new Date(nextAdAt).valueOf() - Date.now()) / 1000)
    const message = `📢 Ad break in ~${secsUntil}s (${durationSeconds}s long). Stretch your legs! PogChamp`

    this.apiClient?.chat
      .sendChatMessageAsApp(this.botId, envConfig.TWITCH_BROADCASTER_ID, message)
      .then(() => log.bot.info(`${message}`))
      .catch((err) => log.bot.error('Chat send failed:', err))
  }

  public async start(): Promise<void> {
    const broadcasterKey = `twitch:${envConfig.TWITCH_BROADCASTER_ID}` as TokenKey
    const botKey = `twitch:${envConfig.TWITCH_BOT_ID}` as TokenKey

    await this.ensureToken(broadcasterKey, 'Broadcaster')
    await this.ensureToken(botKey, 'Bot account')

    const authProvider = await createAuthProvider(
      envConfig.TWITCH_CLIENT_ID,
      envConfig.TWITCH_CLIENT_SECRET,
      this.tokenStore,
    )

    this.initializeClients(authProvider)

    if (envConfig.SPOTIFY_CLIENT_ID && envConfig.SPOTIFY_CLIENT_SECRET) {
      const spotifyToken = (await this.tokenStore.get(
        `spotify:${envConfig.TWITCH_BROADCASTER_ID}`,
      )) as OauthTokenRecord | null

      if (!spotifyToken || !spotifyToken.refreshToken) {
        log.bot.warn('Spotify token missing or malformed — Spotify commands unavailable')
      } else {
        this.spotifyFetcher = new SpotifyFetcher({
          tokenStore: this.tokenStore,
          twitchId: envConfig.TWITCH_BROADCASTER_ID,
          maxRetries: 3,
        })
        log.bot.info('Spotify fetcher initialized')
      }
    }

    const deps: CommandDeps = {
      tokenStore: this.tokenStore,
      spotifyFetcher: this.spotifyFetcher,
      say: this.say.bind(this),
      getCommands: () => this.commandRegistry.list(),
    }
    await this.commandRegistry.loadCommands(path.join(import.meta.dirname, 'commands'), deps)

    await this.eventRegistry.loadEvents(path.join(import.meta.dirname, 'events'), {
      registry: this.commandRegistry,
      bot: this,
      apiClient: this.apiClient,
      say: this.say.bind(this),
    })

    await this.apiClient?.eventSub.deleteAllSubscriptions()
    await this.chatClient?.connect()
    await this.eventSub?.start()

    await this.eventRegistry.registerAll({
      chatClient: this.chatClient!,
      eventSub: this.eventSub!,
      broadcasterId: envConfig.TWITCH_BROADCASTER_ID,
      botUserId: this.botId,
      firstMessageTracker: this.firstMessageTracker,
    })

    this.running = true
    await this.checkInitialStreamState()
  }

  public async stop(): Promise<void> {
    this.stopAdPoller()
    await this.eventSub?.stop()
    await this.chatClient?.quit()
    this.running = false
  }

  private async ensureToken(tokenKey: TokenKey, label: string): Promise<void> {
    const existing = await this.tokenStore.get(tokenKey)

    if (existing) {
      log.bot.info(`${label} token found.`)
      return
    }

    if (label.toLocaleLowerCase() === 'broadcaster') {
      log.bot.warn(`${label} token missing — waiting for authentication...`)
      log.bot.warn(
        `========== Visit http://${config.CLIENT_URL}/api/auth/twitch/login to authenticate. ==========`,
      )
    } else {
      log.bot.warn(`${label} token missing — waiting for authentication...`)
      log.bot.warn(
        `========== Visit http://${config.CLIENT_URL}/twitch-login to authenticate. ==========`,
      )
    }

    await this.authWaiter.waitFor(tokenKey) // blocks here until notify() fires

    log.bot.info(`${label} authenticated — continuing startup.`)
  }

  isRunning() {
    return this.running
  }
}
