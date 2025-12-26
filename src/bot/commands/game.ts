import type { Command } from '@lib/bot/types.js'
import { log } from '@lib/utils/logger.js'

const game: Command = {
    name: 'game',
    aliases: [],
    enabled: true,
    async execute(event, args, apiClient) {
        const channelId = event.broadcasterId
        const displayName = event.chatterDisplayName
        if (args.length === 0) {
            const channelInfo =
                await apiClient.channels.getChannelInfoById(channelId)
            if (!channelInfo) {
                // log an error
                return
            }

            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `@${displayName}, current game: ${channelInfo.gameName}`,
            )
        } else {
            const isMod = await apiClient.moderation.checkUserMod(
                event.broadcasterId,
                event.chatterId,
            )
            const isBroadcaster = event.chatterId === process.env.TWITCH_ID
            if (!isMod && !isBroadcaster) {
                return
            }

            const gameTitle = args.join()
            const gameData = await apiClient.games.getGamesByNames([gameTitle])
            if (!gameData.length) {
                log.bot.warn(
                    `Could not find any games with the title ${gameTitle}`,
                )
                apiClient.chat.sendChatMessageAsApp(
                    process.env.BOT_ID!,
                    event.broadcasterId,
                    `@${displayName} could not find any games with that title. Please check your input and try again.`,
                )
                return
            }

            apiClient.channels.updateChannelInfo(channelId, {
                gameId: gameData[0].id,
            })
        }
    },
}

export default game
