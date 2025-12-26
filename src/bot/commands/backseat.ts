import type { Command } from '@lib/bot/types.js'

const backseat: Command = {
    name: 'backseat',
    aliases: [],
    enabled: true,
    async execute(event, _args, apiClient) {
        const broadcaster = event.broadcasterDisplayName
        apiClient?.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            `Please do not backseat the streamer! when @${broadcaster} needs help, they will ask for it! thank you!`,
        )
    },
}

export default backseat
