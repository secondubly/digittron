import { ApiClient } from '@twurple/api'
import { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'

export enum Role {
    Broadcaster = 'Broadcaster',
    Moderator = 'Moderator',
    Subscriber = 'Subscriber',
    VIP = 'VIP',
    Viewer = 'Viewer',
}

export interface Command {
    name: string
    aliases: string[]
    cooldown?: number
    description?: string
    enabled: boolean
    permissions?: Role[]
    execute(
        event: EventSubChannelChatMessageEvent,
        args: string[],
        apiClient: ApiClient,
    ): Promise<void>
}

// REF: used for https://api.deadlock-api.com/docs
export interface MMRHistory {
    account_id: number
    match_id: number
    start_time: number
    player_score: number
    rank: number
    division: number
    division_tier: number
}
