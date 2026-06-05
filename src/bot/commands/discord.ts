import type { Command } from '@lib/types.js'

const discord: Command = {
    name: 'discord',
    aliases: [],
    enabled: true,
    description: 'the stream discord url',
    async execute(event, _args, apiClient) {
        apiClient.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            `join the discord here: ${process.env.DISCORD_URL}`,
        )
    },
}

export default discord
