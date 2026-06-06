import { ApiClient } from '@twurple/api'
import type { ChatMessage } from '@twurple/chat'
import { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'

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
