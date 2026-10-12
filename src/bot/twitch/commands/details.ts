import { command } from '../services/permissions'
import type { Deps } from '../deps'
import { log } from '@core/logger'
import type { Game } from 'igdb-api-types';

export default function details({ api, auth }: Deps) {
    return command("details", "everyone", async (params, ctx) => {
        const INVALID_GAME_IDS = ['509658', '1469308723'] // 509658 = Just Chatting, 1469308723 = Software & Game Development
        const channelInfo = await api.channels.getChannelInfoById(ctx.broadcasterId)

        if (!channelInfo) {
            // log an error
            log.twitch.error('Could not retrieve channel info for !details command')
            return
        }

        const game = await channelInfo.getGame()
        if (!game) {
            log.twitch.error('Could not retrieve game data for !details command')
            return
        }

        if (INVALID_GAME_IDS.findIndex((gameId) => gameId === game.id) !== -1) {
            log.twitch.info('Game is not a valid !details candidate.')
            return
        }

        const token = await auth.getAccessTokenForUser(ctx.broadcasterId)

        if (!token) {
            log.twitch.error(`Could not retrieve access token for ${ctx.broadcasterId}`)
            return
        }
        
        try {
            const response = await fetch('https://api.igdb.com/v4/games', {
                method: 'POST',
                headers: {
                    'Client-ID': Bun.env.TWITCH_CLIENT_ID!,
                    'Authorization': `Bearer ${token.accessToken}`
                },
                body: `fields storyline, summary; where id = ${game.igdbId};`,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as Game[]
            const gameData = data[0]

            if (!gameData) {
                log.twitch.warn(`No game data found for ${game.name}`)
                return
            }

            let message = buildResponse(gameData)

            let messages: string[] = []
            if (message.length > 500) {
                // strip any newlines before trying to split string
                message = message.replace(/[\r\n]+/g, ' ')
                messages = splitStringIntoParts(message)
            }

            if (messages.length) {
                for (const part of messages) {
                    ctx.say(part)
                    await Bun.sleep(1500) // wait a bit before sending the next message
                }
            } else {
                ctx.say(message)
            }
        } catch (e) {
            log.twitch.error(e)
        }
    })
}

const buildResponse = (data: Game) => {
    let message: string
    if (data.storyline) {
        message = data.storyline
    } else if (data.summary) {
        message = data.summary
    } else {
        message = 'Could not get a good enough summary for this game, ask the streamer!'
    }
    
    return message
}

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