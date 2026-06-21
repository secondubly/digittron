import type { TokenStore } from '@core/tokens/TokenStore'
import type { ApiClient } from '@twurple/api'
import type { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'
import type { SpotifyFetcher } from './services/SpotifyFetcher'
import type { Bot } from './bot'

export interface CommandDeps {
  tokenStore: TokenStore
  spotifyFetcher: SpotifyFetcher | undefined
  say: Bot['say']
  getCommands: () => Command[]
}

export interface CommandContext {
  client: ApiClient
  channel: string
  msg: EventSubChannelChatMessageEvent
  args: string[]
  rawMsg: string
  say: (message: string) => Promise<void>
}

export interface Command {
  name: string
  aliases?: string[]
  description: string
  cooldownMs?: number // per-user cooldown
  modOnly?: boolean
  execute(ctx: CommandContext): Promise<void>
}

export interface BotConfig {
  broadcasterId: string
  botId: string
  channels: string[]
  // if we're running the bot by itself, this should be true
  isStandalone?: boolean
}

export interface FirstMessageEvent {
  chatterId: string
  chatterName: string
  message: string
  timestamp: string // a date in ISO format
}
