import type { Command, CommandContext, CommandDeps } from '@lib/bot/types'
import { log } from '@lib/services/logger'
import type { SpotifyFetcher } from '@lib/services/spotify'
import { parseCurrentlyPlaying } from '@lib/utils/spotify/parseArtist'
import { Value } from '@sinclair/typebox/value'
import { currentlyPlayingSchema } from 'src/server/schemas/spotify'

export default ({ spotifyFetcher }: CommandDeps): Command => ({
    name: 'nowplaying',
    aliases: ['np', 'playing'],
    description: 'Shows artist and title of currently playing song',
    async execute({ msg, say }: CommandContext) {
        const { chatterDisplayName } = msg

        if (!spotifyFetcher) {
            log.bot.warn(
                `${chatterDisplayName} attempted to call !${this.name} but there's no spotify client!`,
            )
            return
        }

        const result = await getCurrentlyPlayingTrack(spotifyFetcher)

        if (!result) {
            say(`🎵 Nothing playing right now.`)
            return
        }

        const { isPlaying, albumName } = result
        const status = isPlaying ? '🎵' : '⏸️'

        say(`${status} ${result.chatMessage} — ${albumName}`)
    },
})

async function getCurrentlyPlayingTrack(fetcher: SpotifyFetcher) {
    const { data, status, ok, error } = await fetcher.getCurrentlyPlaying()

    if (!ok) {
        log.api.warn(`Spotify currently playing failed: ${error}`)
        return null
    }

    // 204 = nothing playing
    if (status === 204 || !data) return null

    // validate with TypeBox
    if (!Value.Check(currentlyPlayingSchema, data)) {
        log.api.warn('Spotify response failed schema validation')
        return null
    }

    return parseCurrentlyPlaying(Value.Parse(currentlyPlayingSchema, data))
}
