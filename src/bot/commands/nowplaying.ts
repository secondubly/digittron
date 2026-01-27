import type { Command } from '@lib/bot/types.js'
import { log } from '@lib/utils/logger.js'
import { getSpotifyToken } from '@lib/utils/utils'
import {
    SpotifyApi,
    type AccessToken,
    type SimplifiedTrack,
    type Track,
} from '@spotify/web-api-ts-sdk'

let spotifyApi: SpotifyApi

const nowplaying: Command = {
    name: 'nowplaying',
    aliases: ['np', 'playing'],
    enabled: true,
    async execute(event, _args, apiClient) {
        const spotifyAccessToken = await getSpotifyToken(event.broadcasterId)
        const { chatterDisplayName: displayName } = event
        if (!spotifyAccessToken) {
            log.bot.warn(
                'Spotify access token not found, nowplaying command will not work!',
            )
            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `${displayName} could not get currently playing track.`,
            )
            return
        } else {
            const response = await getNowPlayingTrack(spotifyAccessToken)

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
        }
    },
}

const getNowPlayingTrack = async (
    accessToken: AccessToken,
): Promise<string | null> => {
    if (!spotifyApi) {
        spotifyApi = SpotifyApi.withAccessToken(
            process.env.SPOTIFY_CLIENT_ID!,
            accessToken,
        )
    }

    const result = await spotifyApi.player.getCurrentlyPlayingTrack()
    if (result.item.type === 'track') {
        const currentTrack = result.item as unknown as Track
        return `“${currentTrack.name}” by ${currentTrack.artists[0].name}`
    } else {
        return null
    }
}

export default nowplaying
