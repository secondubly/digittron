import type { TokenStore } from '@lib/core/tokens/TokenStore'
import type { ApiClient } from '@twurple/api'
import type { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'
import type { SpotifyFetcher } from '@lib/services/spotify'
import type { Bot } from 'src/bot/bot'

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
