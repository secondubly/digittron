import type { Command, CommandContext } from '@lib/bot/types.js'
import { config } from 'src/config/env'

const wishlist: Command = {
    name: 'wishlist',
    aliases: [],
    description: 'Stream wishlist links',
    async execute({ msg, client }: CommandContext) {
        const { broadcasterId } = msg
        client.chat.sendChatMessageAsApp(
            config.TWITCH_BOT_ID,
            broadcasterId,
            'throne: https://throne.com/secondubly | steam: https://store.steampowered.com/wishlist/id/secondubly',
        )
    },
}

export default wishlist
