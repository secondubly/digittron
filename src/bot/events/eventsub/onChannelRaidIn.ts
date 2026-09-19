import { log } from '@core/utils/logger'
import type { EventDeps, EventSubEvent } from '../types'

export default ({ apiClient, say }: EventDeps): EventSubEvent => ({
  type: 'eventsub',
  name: 'onChannelRaidIn',
  async register({ eventSub, broadcasterId, botUserId }) {
    const listener = eventSub.onChannelRaidTo(broadcasterId, async (event) => {
      // get game info for raidingUser
      const raiderId = event.raidingBroadcasterId
      const channelInfo = await apiClient.channels.getChannelInfoById(raiderId)

      if (!channelInfo) {
        log.bot.warn('Could not retrieve info for raiding broadcaster')
        return
      }

      const raidMsg = `Everyone say hi to ${event.raidingBroadcasterDisplayName}! They were playing ${channelInfo.gameName ?? 'absolutely nothing!'}!`
      await say(event.raidedBroadcasterName, raidMsg)

      // shoutout raider
      try {
        await apiClient.asUser(botUserId, async (ctx) => {
          await ctx.chat.shoutoutUser(broadcasterId, raiderId)
        })
      } catch (e) {
        if (e instanceof Error) {
          log.bot.error(`Error: ${e.message}`)
        } else {
          log.bot.error(`Unexpected error occurred: ${e}`)
        }
      }
    })

    if (process.env.NODE_ENV !== 'production') {
      console.log(await listener.getCliTestCommand())
    }
  },
})
