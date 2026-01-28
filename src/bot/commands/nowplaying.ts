import type { Command } from '@lib/bot/types.js'
import { authFetch } from '@lib/core/fetch'
import type { PlaybackState, Track } from '@spotify/web-api-ts-sdk'

const nowplaying: Command = {
    name: 'nowplaying',
    aliases: ['np', 'playing'],
    enabled: true,
    async execute(event, _args, apiClient) {
        const { chatterDisplayName: displayName } = event
        const response = await getNowPlayingTrack()

        if (response) {
            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `${displayName} ${response}`,
            )
        } else {
            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `${displayName} nothing is playing right now!`,
            )
        }
    },
}

const getNowPlayingTrack = async (): Promise<string | null> => {
    const response = await authFetch(
        'https://api.spotify.com/v1/me/player/currently-playing',
        {
            headers: {},
        },
    )

    if (!response.ok) {
        console.error('Response', response)
        return null
    }

    const body = await response.json()
    if (!body) {
        return null
    } else {
        const data: PlaybackState = body
        if (data.item && data.item.type === 'track') {
            const track = data.item as Track
            const title = track.name
            const artist = track.album.artists[0].name
            return `“${title}” by ${artist}`
        }
    }
    return null
}

export default nowplaying
