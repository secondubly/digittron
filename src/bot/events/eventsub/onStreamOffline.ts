import { log } from '@lib/services/logger'
import type { BotContext, EventDeps } from '../types'

export default ({ bot }: EventDeps) => ({
    type: 'eventsub',
    name: 'onStreamOffline',
    register({ eventSub, broadcasterId }: BotContext) {
        eventSub.onStreamOffline(broadcasterId, (event) => {
            log.bot.debug(
                `Stream offline, stopping ad poller for ${event.broadcasterId}`,
            )
            bot.stopAdPoller()
            bot.clearFirstTimeChatters()
        })
    },
})
