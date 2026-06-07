import type { Command } from '@lib/bot/types.js'
import { config } from 'src/config'

const backseat: Command = {
    name: 'backseat',
    aliases: [],
    description: 'Warning about backseating',
    execute: async function ({ channel, client }) {
        client.chat.sendChatMessageAsApp(
            config.TWITCH_BOT_ID,
            config.TWITCH_BROADCASTER_ID,
            `Please do not backseat the streamer! when @${channel} needs help, they will ask for it! Thank you!`,
        )
    },
}

export default backseat
