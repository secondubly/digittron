import { log } from '@core/utils/logger'
import type { BotContext, EventDeps } from '../types'

export default ({ bot }: EventDeps) => ({
  type: 'eventsub',
  name: 'onStreamOnline',
  register({ eventSub, broadcasterId, firstMessageTracker }: BotContext) {
    eventSub.onStreamOnline(broadcasterId, (_event) => {
      log.bot.debug(`Received stream online event for ${broadcasterId}`)
      firstMessageTracker.setOnline()
      bot.startAdPoller()
    })
  },
})
