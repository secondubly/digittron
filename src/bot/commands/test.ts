import type { Command } from '@lib/bot/types.js'

const test: Command = {
    name: 'test',
    aliases: [],
    enabled: true,
    async execute(event, _args, apiClient) {
        apiClient.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            'this is a test of the emergency bot system! 🚨',
        )
    },
}

export default test
