import { EventSubChannelRaidModerationEvent } from '@twurple/eventsub-base'
import type { EventSubEvent } from '../types'
import { config } from 'src/config'
import { log } from '@lib/services/logger'

export default {
    type: 'eventsub',
    name: 'onChannelModerate',
    register({ eventSub, apiClient, broadcasterId, botUserId }) {
        eventSub.onChannelModerate(broadcasterId, botUserId, async (event) => {
            if (!(event instanceof EventSubChannelRaidModerationEvent)) {
                return
            }
            const raidedChannel = event.userDisplayName
            const messages = [
                `We're raiding @${raidedChannel}!`,
                `Use this as the raid message: second15Raid 01010010 01000001 01001001 01000100 00100001 00100001 00100001 second15Raid`,
            ]
            for (const message of messages) {
                await apiClient.chat.sendChatMessageAsApp(
                    botUserId,
                    broadcasterId,
                    message,
                )
                // wait a bit before sending the next message
                await new Promise((resolve) => setTimeout(resolve, 1500))
            }
            log.bot.debug(
                `Received stream online event for ${config.TWITCH_BROADCASTER_ID}`,
            )
        })
    },
} satisfies EventSubEvent
