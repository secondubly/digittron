import { log } from '@lib/services/logger'
import type { ChatEvent } from '../types'
import { config } from 'src/config/env'

const isFirstConnection = true

export default {
    type: 'chat',
    name: 'onDisconnect',
    register({ chatClient }) {
        chatClient.onConnect(() => {
            // TODO: make special startup messages for the bot
            log.bot.info(
                `${isFirstConnection ? 'Connected' : 'Reconnected'} to Twitch, requesting ${config.TWITCH_CHANNELS.length} channels: ${config.TWITCH_CHANNELS.join(', ')}`,
            )
        })
    },
} satisfies ChatEvent
