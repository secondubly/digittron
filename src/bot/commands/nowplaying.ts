import type { Command, CommandContext, CommandDeps } from '@lib/bot/types'
import { log } from '@lib/services/logger'
import { getCurrentlyPlayingTrack } from '@lib/services/spotify'
import { config } from 'src/config/env'

export default ({ tokenStore }: CommandDeps): Command => ({
    name: 'nowplaying',
    aliases: ['np', 'playing'],
    description: 'Shows artist and title of currently playing song',
    async execute({ client, msg }: CommandContext) {
        const { chatterDisplayName, broadcasterId } = msg
        const response = await getCurrentlyPlayingTrack(tokenStore)()

        if (typeof response === 'number') {
            if (response === 203) {
                client.chat.sendChatMessageAsApp(
                    config.TWITCH_BOT_ID,
                    broadcasterId,
                    `${chatterDisplayName} nothing is playing right now!`,
                )
            } else {
                log.bot.error(
                    'Something went wrong trying to fetch the currently playing track',
                )
            }

            return
        } else {
            const nowplaying = `“${response.item.name}” by ${response.item.artists.map((a) => a.name).join(',')}`
            client.chat.sendChatMessageAsApp(
                config.TWITCH_BOT_ID,
                broadcasterId,
                `${chatterDisplayName} ${nowplaying}`,
            )
        }
    },
})
