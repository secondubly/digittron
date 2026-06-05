import type { Command } from '@lib/types.js'
import { getCurrentlyPlayingTrack } from '@lib/utils/spotify'

const nowplaying: Command = {
    name: 'nowplaying',
    aliases: ['np', 'playing'],
    enabled: true,
    description: 'Shows artist and title of currently playing song',
    async execute(event, _args, apiClient) {
        const { chatterDisplayName: displayName } = event
        const response = await getCurrentlyPlayingTrack()

        if (typeof response === 'number') {
            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `${displayName} nothing is playing right now!`,
            )
            return
        } else {
            const nowplaying = `“${response.item.name}” by ${response.item.artists.map((a) => a.name).join(',')}`
            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `${displayName} ${nowplaying}`,
            )
        }
    },
}

export default nowplaying
