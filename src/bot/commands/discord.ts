import type { CommandContext } from '@lib/bot/types'
import type { Command } from '@lib/bot/types.js'

const discord: Command = {
    name: 'discord',
    aliases: [],
    description: 'the stream discord url',
    async execute({ client, msg }: CommandContext) {
        const { broadcasterId } = msg
        client.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            broadcasterId,
            `join the discord here: ${process.env.DISCORD_URL}`,
        )
    },
}

export default discord
