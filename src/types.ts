import { ApiClient } from '@twurple/api'
import { ChatClient, ChatMessage } from '@twurple/chat'

export interface Command {
    name: string
    aliases: string[]
    cooldown?: number
    enabled: boolean
    execute(
        client: ChatClient,
        channel: string,
        msg: ChatMessage,
        args: string[],
        apiClient?: ApiClient,
    ): Promise<void>
}
