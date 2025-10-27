import { Command } from '../types.js'
import logger from '../logger.js'

const game: Command = {
    name: 'game',
    aliases: [],
    enabled: true,
    async execute(client, channel, msg, args, apiClient) {
        if (!apiClient) {
            logger.error(
                `api client not found, cannot execute ${this.name} command`,
            )
            return
        }
        const { channelId } = msg
        if (!channelId) {
            logger.warn(
                'Channel ID not found, is this possibly a private message?',
            )
            return
        }

        const { displayName } = msg.userInfo
        if (args.length === 0) {
            const channelInfo =
                await apiClient.channels.getChannelInfoById(channelId)
            if (!channelInfo) {
                // log an error
                return
            }

            client.say(
                channel,
                `@${displayName}, current game: ${channelInfo.gameName}`,
            )
        } else {
            const gameTitle = args.join()
            const gameData = await apiClient.games.getGamesByNames([gameTitle])
            if (!gameData.length) {
                logger.warn(
                    `Could not find any games with the title ${gameTitle}`,
                )
                client.say(
                    channel,
                    `@${displayName} could not find any games with that title. Please check your input and try again.`,
                )
                return
            }

            apiClient.channels.updateChannelInfo(channelId, {
                gameId: gameData[0].id,
            })

            client.say(
                channel,
                `@${displayName} updated game title to: ${gameData[0].name}.`,
            )
        }
    },
}

export default game
