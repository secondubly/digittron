import { log } from '@lib/services/logger'
import type { EventSubEvent } from '../types'

export default {
    type: 'eventsub',
    name: 'onStreamOnline',
    register({ eventSub, broadcasterId }) {
        eventSub.onStreamOnline(broadcasterId, (_event) => {
            log.bot.debug(`Received stream online event for ${broadcasterId}`)
        })
    },
} satisfies EventSubEvent
