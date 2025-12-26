import { log } from '@lib/utils/logger.js'
import type { Command } from '@lib/bot/types.js'
import { type Game } from 'igdb-api-types'

const details: Command = {
    name: 'details',
    aliases: [],
    enabled: true,
    async execute(event, args, apiClient) {
        if (args.length === 0) {
            log.bot.error(
                'App access token not provided for !details command. Cannot complete request.',
            )
            return
        }
        const channelId = event.broadcasterId

        /**
         * These game IDs are invalid for the purposes of querying the IGDB API
         * 509658 = Just Chatting
         * 1469308723 = Software & Game Development
         *
         */
        const INVALID_GAME_IDS = ['509658', '1469308723']
        const channelInfo =
            await apiClient.channels.getChannelInfoById(channelId)
        if (!channelInfo) {
            // log an error
            log.bot.error('Could not retrieve channel info for !details command')
            return
        }

        const game = await channelInfo.getGame()
        if (!game) {
            log.bot.error('Could not retrieve game data for !details command')
            return
        }

        if (INVALID_GAME_IDS.findIndex((gameId) => gameId === game.id) !== -1) {
            log.bot.info('game is not a valid !details candidate.')
            return
        }

        const appAccessToken = args[0]
        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': process.env.CLIENT_ID!,
                Authorization: `Bearer ${appAccessToken}`,
            },
            body: `fields storyline, summary; where id = ${game.igdbId};`,
        })

        if (!response.ok) {
            log.bot.error(`Could not retrieve game summary: ${response.status}`)
            return
        }

        const data = (await response.json()) as Game[]
        const gameData = data[0]

        if (!gameData) {
            log.bot.warn(`No game data found for ${game.name}`)
            return
        }

        let message: string
        if (gameData.storyline) {
            message = gameData.storyline
        } else if (gameData.summary) {
            message = gameData.summary
        } else {
            message =
                'Could not get a good enough summary for this game, ask the streamer!'
        }

        apiClient.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            message,
        )
    },
}

export default details
