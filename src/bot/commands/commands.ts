import type { Command } from '@lib/bot/types.js'

const commands: Command = {
    name: 'commands',
    aliases: [],
    enabled: true,
    async execute(event, args, apiClient) {
        const commands = args.slice(0, -1).join(', ')
        const displayName = event.chatterName
        apiClient?.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            `@${displayName} available commands: ${commands}`,
        )
    },
}

export default commands
