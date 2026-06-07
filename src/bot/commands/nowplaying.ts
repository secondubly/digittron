import type { Command, CommandContext } from '@lib/bot/types'
import { getCurrentlyPlayingTrack } from '@lib/services/spotify'
import { config } from 'src/config'

const nowplaying: Command = {
    name: 'nowplaying',
    aliases: ['np', 'playing'],
    description: 'Shows artist and title of currently playing song',
    async execute({ client, msg }: CommandContext) {
        const { chatterDisplayName: displayName, broadcasterId } = msg
        const response = await getCurrentlyPlayingTrack()

        if (typeof response === 'number') {
            client.chat.sendChatMessageAsApp(
                config.TWITCH_BOT_ID,
                broadcasterId,
                `${displayName} nothing is playing right now!`,
            )
            return
        } else {
            const nowplaying = `“${response.item.name}” by ${response.item.artists.map((a) => a.name).join(',')}`
            client.chat.sendChatMessageAsApp(
                config.TWITCH_BOT_ID,
                broadcasterId,
                `${displayName} ${nowplaying}`,
            )
        }
    },
}

export default nowplaying
