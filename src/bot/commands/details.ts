import { log } from '@core/utils/logger.js'
import type { Command, CommandDeps } from '../types.js'
import { config } from '@core/config/env'
import type { TokenRecord } from '@core/tokens/types'

export default ({ tokenStore }: CommandDeps): Command => ({
  name: 'details',
  aliases: [],
  // enabled: true,
  description: 'Description of currently streaming game',
  async execute({ client, msg, say }) {
    /**
     * These game IDs are invalid for the purposes of querying the IGDB API
     * 509658 = Just Chatting
     * 1469308723 = Software & Game Development
     *
     */
    const INVALID_GAME_IDS = ['509658', '1469308723']
    const channelInfo = await client.channels.getChannelInfoById(
      msg.broadcasterId,
    )
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
      log.bot.info('Game is not a valid !details candidate.')
      return
    }

    const { accessToken } = (await tokenStore.get(
      `twitch:${config.TWITCH_BOT_ID}`,
    )) as TokenRecord

    if (!accessToken) {
      log.bot.warn(`Could not retrieve access token for ${this.name} request`)
      return
    }

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': config.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: `fields storyline, summary; where id = ${game.igdbId};`,
    })

    if (!response.ok) {
      log.bot.error(`Could not retrieve game summary: ${response.status}`)
      return
    }

    const data = await response.json()
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

    let messages: string[] = []
    if (message.length > 500) {
      // strip any newlines before trying to split string
      message = message.replace(/[\r\n]+/g, ' ')
      messages = splitStringIntoParts(message)
    }

    try {
      if (messages.length) {
        for (const part of messages) {
          say(part)
          // wait a bit before sending the next message
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }
      } else {
        say(message)
      }
    } catch (error) {
      log.bot.error(error)
    }
  },
})

const splitStringIntoParts = (text: string, size = 500): string[] => {
  const words = text.split(' ')
  const parts: string[] = []
  let currentBlock = ''
  for (const word of words) {
    // get possible block length by adding current block length with the length of a space and the current word
    const possibleBlockLength = currentBlock.length + (' ' + word).trim().length
    if (possibleBlockLength <= size) {
      currentBlock = (currentBlock + ' ' + word).trim()
    } else {
      parts.push(currentBlock)
      currentBlock = word
    }
  }

  if (currentBlock.length) {
    // push any leftover blocks
    parts.push(currentBlock)
  }

  return parts
}
