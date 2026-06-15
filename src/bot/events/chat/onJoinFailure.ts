import { log } from '@lib/services/logger'
import type { ChatEvent } from '../types'

export default {
    type: 'chat',
    name: 'onJoinFailure',
    register({ chatClient }) {
        chatClient.onJoinFailure((channel, reason) => {
            log.bot.error(`Failed to join: #${channel}: ${reason}`)
        })
    },
} satisfies ChatEvent
