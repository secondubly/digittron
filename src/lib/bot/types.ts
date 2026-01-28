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
