import { log } from '@core/utils/logger'
import type { EventDeps, EventSubEvent } from '../types'

export default ({ apiClient, say }: EventDeps): EventSubEvent => ({
  type: 'eventsub',
  name: 'onChannelRaidIn',
  async register({ eventSub, broadcasterId, botUserId }) {
    const listener = eventSub.onChannelRaidTo(broadcasterId, async (event) => {
      // get game info for raidingUser
      const raiderId = event.raidingBroadcasterId

      const raidMsg = `Welcome raiders! Thank you so much for the raid ${event.raidingBroadcasterDisplayName}! Don't forget to give them a follow over at https://twitch.tv/${event.raidedBroadcasterName}!'}!`
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
