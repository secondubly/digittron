import { ApiClient } from "@twurple/api";
import { ChatClient, ChatMessage, ChatUser } from "@twurple/chat";

export interface Command {
    name: string,
    aliases: string[],
    cooldown?: number,
    onCooldown?: boolean
    execute(client: ChatClient, channel: string, msg: ChatMessage, args: string[], apiClient?: ApiClient): Promise<void>
}