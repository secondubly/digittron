import type { Command, CommandContext } from '@lib/bot/types.js'
import { log } from '@lib/services/logger.js'
import type { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'
import { config } from 'src/config/env'

const isMod = (msg: EventSubChannelChatMessageEvent): boolean => {
    // broadcaster is considered a mod in almost all cases
    return (
        msg.chatterId === msg.broadcasterId ||
        Object.keys(msg.badges).some((b) => b === 'moderator')
    )
}

const game: Command = {
    name: 'game',
    aliases: [],
    description:
        'Show currently streaming game (for viewers) OR change the current game.',
    async execute({ client, msg, args }: CommandContext) {
        const { broadcasterId, chatterDisplayName } = msg
        if (args.length === 0) {
            const channelInfo =
                await client.channels.getChannelInfoById(broadcasterId)
            if (!channelInfo) {
                log.bot.error(
                    'Could not retrieve channel info for !details command',
                )
                return
            }

            client.chat.sendChatMessageAsApp(
                config.TWITCH_BOT_ID,
                broadcasterId,
                `@${chatterDisplayName}, current game: ${channelInfo.gameName}`,
            )
        } else {
            if (!isMod(msg)) {
                return
            }

            const gameTitle = args.join(' ')
            const gameData = await client.games.getGamesByNames([gameTitle])
            if (!gameData.length) {
                log.bot.warn(
                    `Could not find any games with the title ${gameTitle}`,
                )
                client.chat.sendChatMessageAsApp(
                    process.env.BOT_ID!,
                    broadcasterId,
                    `@${chatterDisplayName} could not find any games with that title. Please check your input and try again.`,
                )
                return
            }

            client.channels.updateChannelInfo(broadcasterId, {
                gameId: gameData[0].id,
            })

            client.chat.sendChatMessageAsApp(
                config.TWITCH_BOT_ID,
                broadcasterId,
                `Successfully updated game to ${gameTitle}.`,
            )
        }
    },
}

export default game
