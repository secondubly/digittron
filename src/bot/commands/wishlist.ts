import type { Command } from '@lib/bot/types.js'

const wishlist: Command = {
    name: 'wishlist',
    aliases: [],
    enabled: true,
    async execute(event, _args, apiClient) {
        apiClient.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            'throne: https://throne.com/secondubly | steam: https://store.steampowered.com/wishlist/id/secondubly',
        )
    },
}

export default wishlist
