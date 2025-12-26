import { ApiClient } from '@twurple/api'
import type { AccessToken } from '@twurple/auth'
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

export interface TokenApiResponse {
    token: AccessToken
}
