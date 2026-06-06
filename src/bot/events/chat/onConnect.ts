import { log } from '@lib/services/logger'
import type { ChatEvent } from '../types'

export default {
    type: 'chat',
    name: 'onDisconnect',
    register({ chatClient }) {
        chatClient.onConnect(() => {
            const connectedCount = chatClient.currentChannels.length
            log.bot.info(
                `Connected to ${connectedCount} ${connectedCount === 1 ? 'channel' : 'channels'}: ${chatClient.currentChannels.join(', ')}`,
            )
        })
    },
} satisfies ChatEvent
