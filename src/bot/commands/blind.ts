import type { Command } from '@lib/bot/types.js'
import { config } from 'src/config'

const blind: Command = {
    name: 'blind',
    aliases: [],
    // enabled: true,
    description: 'Explanation of blind playthroughs',
    execute: async function ({ client }) {
        client.chat.sendChatMessageAsApp(
            config.TWITCH_BOT_ID,
            config.TWITCH_BROADCASTER_ID,
            `This is a first time playthrough, please do not backseat or give fake spoilers. If the streamer needs help, they will ask designated chatters. All questions are rhetorical unless otherwise stated.`,
        )
    },
}

export default blind
