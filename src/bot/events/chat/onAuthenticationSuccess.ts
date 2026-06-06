import { log } from '@lib/services/logger'
import type { ChatEvent } from '../types'

export default {
    type: 'chat',
    name: 'onAuthenticationSuccess',
    register({ chatClient }) {
        chatClient.onAuthenticationSuccess(() => {
            log.bot.info(`Ready to yap! 😃`)
        })
    },
} satisfies ChatEvent
