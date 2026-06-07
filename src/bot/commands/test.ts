import type { Command } from '@lib/bot/types.js'
import { config } from 'src/config'

const test: Command = {
    name: 'test',
    aliases: ['test'],
    description: 'Tests whether the bot is active in the chat or not.',
    execute: async function ({ client }): Promise<void> {
        client.chat.sendChatMessageAsApp(
            config.TWITCH_BOT_ID,
            config.TWITCH_BROADCASTER_ID,
            'This is a test of the emergency bot system! 🚨',
        )
    },
}
export default test
