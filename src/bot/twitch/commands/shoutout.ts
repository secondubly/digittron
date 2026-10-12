import { log } from '@core/logger'
import type { Deps } from '../deps'
import { command } from '../services/permissions'

export default function shoutout({ api, botId }: Deps) {
    return command('shoutout', 'mod', async (params, ctx) => {
    const target = params[0]?.replace('@', '').toLocaleLowerCase()
    if (!target) {
      ctx.say(`Invalid command! Usage: !shoutout @username`)
      return
    }

    const user = await api.users.getUserByName(target)
    if (!user) {
      ctx.say(`User @${target} not found.`)
      return
    }

    const channel = ctx.broadcasterId
    try {
      await api.asUser(botId, async (ctx) => {
        await ctx.chat.shoutoutUser(channel, user.id)
      })
    } catch (e) {
      if (e instanceof Error) {
        log.twitch.warn(`Shoutout command error: ${e.message}`)
        // fall back to custom shoutout message
        const targetGame = await api.channels.getChannelInfoById(user.id)
        let shoutoutMsg = `Go show ${user.displayName} some love over at https://twitch.tv/${user.name}!`
        if (!targetGame) {
          ctx.say(shoutoutMsg)
        } else {
          shoutoutMsg += ` They last played ${targetGame.gameName}`
          ctx.say(shoutoutMsg)
        }
      } else {
        log.twitch.error(`Unexpected error occurred: ${e}`)
      }
      return
    }
})
}
