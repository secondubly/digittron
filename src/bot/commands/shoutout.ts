import { config } from '@core/config/env.js'
import type { Command } from '../types.js'
import { log } from '@core/utils/logger.js'

const test: Command = {
  name: 'shoutout',
  aliases: ['so'],
  enabled: true,
  modOnly: true,
  description: 'Shouts out the requested user.',
  execute: async function ({ client, channel, args, say }): Promise<void> {
    const target = args[0]?.replace('@', '').toLocaleLowerCase()
    if (!target) {
      say(`Invalid command! Usage: !shoutout @username`)
      return
    }

    const targetUser = await client.users.getUserByName(target)
    if (!targetUser) {
      say(`User @${target} not found.`)
      return
    }

    try {
      await client.asUser(config.TWITCH_BOT_ID, async (ctx) => {
        await ctx.chat.shoutoutUser(channel, targetUser.id)
      })
    } catch (e) {
      if (e instanceof Error) {
        log.bot.warn(`Shoutout command error: ${e.message}`)
        // fall back to custom shoutout message
        const targetGame = await client.channels.getChannelInfoById(targetUser.id)
        let shoutoutMsg = `Go show ${targetUser.displayName} some love over at https://twitch.tv/${targetUser.name}!`
        if (!targetGame) {
          say(shoutoutMsg)
        } else {
          shoutoutMsg += ` They last played ${targetGame.gameName}`
          say(shoutoutMsg)
        }
      } else {
        log.bot.error(`Unexpected error occurred: ${e}`)
      }

      return
    }
  },
}
export default test
