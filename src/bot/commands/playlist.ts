import type { Command } from '@lib/bot/types.js'

const playlist: Command = {
    name: 'playlist',
    aliases: [],
    enabled: true,
    async execute(event, _args, apiClient) {
        apiClient.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            `@${event.chatterDisplayName} starting soon playlist: https://open.spotify.com/playlist/666mjTAcb7PYiWEnincpNt?si=54d75be2632741ac`,
        )
    },
}

export default playlist
