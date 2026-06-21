import { log } from '@core/utils/logger'
import type { EventDeps, EventSubEvent } from '../types'

export default ({ apiClient, say }: EventDeps): EventSubEvent => ({
  type: 'eventsub',
  name: 'onChannelRaidIn',
  register({ eventSub, broadcasterId, botUserId }) {
    eventSub.onChannelRaidTo(broadcasterId, async (event) => {
      // get game info for raidingUser
      const channelInfo = await apiClient.channels.getChannelInfoById(
        event.raidingBroadcasterId,
      )
      if (!channelInfo) {
        log.bot.warn('Could not retrieve channel info for raider')
        return
      }

      const gameInfo = await channelInfo.getGame()
      if (!gameInfo) {
        log.bot.warn('Could not get game info for raider')
        return
      }

      // shoutout raider
      await apiClient.asUser(botUserId, async (ctx) => {
        await ctx.chat.shoutoutUser(botUserId, event.raidingBroadcasterId)
      })

      const raidMsg = `Everyone say hi to ${event.raidingBroadcasterDisplayName}! They were playing ${gameInfo.name}!`
      say(event.raidedBroadcasterName, raidMsg)
    })
  },
})
