import type { Command } from '@lib/bot/types.js'

const anniversary: Command = {
    name: 'd20',
    aliases: [],
    enabled: true,
    async execute(event, _args, apiClient) {
        const displayName = event.chatterDisplayName
        const roll = Math.floor(Math.random() * 20 + 1)
        apiClient.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            `${displayName} rolled a ${roll}${roll === 20 ? '! 🎉' : '.'}`,
        )
        // TODO: if user rolled a 1, timeout for 1 minute
    },
}
export default anniversary
