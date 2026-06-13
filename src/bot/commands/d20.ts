import type { Command, CommandContext } from '@lib/bot/types.js'
import { config } from 'src/config/env'

const d20: Command = {
    name: 'd20',
    aliases: [],
    description: 'Roll a d20',
    execute: async function ({ client, msg }: CommandContext): Promise<void> {
        const displayName = msg.chatterDisplayName
        const roll = Math.floor(Math.random() * 20 + 1)
        client.chat.sendChatMessageAsApp(
            config.TWITCH_BOT_ID,
            config.TWITCH_BROADCASTER_ID,
            `${displayName} rolled a ${roll}${roll === 20 ? '! 🎉' : ''}`,
        )
        // TODO: if user rolled a 1, timeout for 1 minute
    },
}

export default d20
