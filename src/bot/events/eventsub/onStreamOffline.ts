import { log } from '@core/utils/logger'
import type { BotContext, EventDeps } from '../types'

export default ({ bot }: EventDeps) => ({
  type: 'eventsub',
  name: 'onStreamOffline',
  register({ eventSub, broadcasterId, firstMessageTracker }: BotContext) {
    eventSub.onStreamOffline(broadcasterId, (event) => {
      log.bot.debug(`Stream offline, stopping services for ${event.broadcasterId}`)

      firstMessageTracker.setOffline()
      bot.stopAdPoller()
    })
  },
})
