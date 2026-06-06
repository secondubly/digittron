import { log } from '@lib/services/logger'
import type { ChatEvent } from '../types'

export default {
    type: 'chat',
    name: 'onDisconnect',
    register({ chatClient }) {
        chatClient.onDisconnect((graceful) => {
            log.bot.info(
                `I\'ve been ${graceful ? 'gracefully' : 'forcibly'} disconnected!`,
            )
        })
    },
} satisfies ChatEvent
