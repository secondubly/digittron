import { log } from '@lib/services/logger'
import type { BotContext, EventDeps } from '../types'

export default ({ bot, firstMessageTracker }: EventDeps) => ({
    type: 'eventsub',
    name: 'onStreamOffline',
    register({ eventSub, broadcasterId }: BotContext) {
        eventSub.onStreamOffline(broadcasterId, (event) => {
            log.bot.debug(
                `Stream offline, stopping services for ${event.broadcasterId}`,
            )

            firstMessageTracker.setOffline()
            bot.stopAdPoller()
        })
    },
})
