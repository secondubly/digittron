import { log } from '@lib/services/logger'
import type { BotContext, EventDeps } from '../types'

export default ({ bot }: EventDeps) => ({
    type: 'eventsub',
    name: 'onStreamOnline',
    register({ eventSub, broadcasterId }: BotContext) {
        eventSub.onStreamOnline(broadcasterId, (_event) => {
            bot.startAdPoller()
            log.bot.debug(`Received stream online event for ${broadcasterId}`)
        })
    },
})
