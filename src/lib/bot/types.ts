import type { ApiClient } from '@twurple/api'
import type { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'

export enum Role {
    Broadcaster = 'Broadcaster',
    Moderator = 'Moderator',
    Subscriber = 'Subscriber',
    VIP = 'VIP',
    Viewer = 'Viewer',
}

export interface CommandContext {
    client: ApiClient
    channel: string
    msg: EventSubChannelChatMessageEvent
    args: string[]
    rawMsg: string
}

export interface Command {
    name: string
    aliases?: string[]
    description: string
    cooldownMs?: number // per-user cooldown
    modOnly?: boolean
    execute(ctx: CommandContext): Promise<void>
}
