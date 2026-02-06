import { ApiClient } from '@twurple/api'
import { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'

export interface Command {
    name: string
    aliases: string[]
    cooldown?: number
    enabled: boolean
    execute(
        event: EventSubChannelChatMessageEvent,
        args: string[],
        apiClient: ApiClient,
    ): Promise<void>
}

// REF: used for https://api.deadlock-api.com/docs
export type MMRHistory = {
    account_id: number
    match_id: number
    start_time: number
    player_score: number
    rank: number
    division: number
    division_tier: number
}
