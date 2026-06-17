import type { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'
import type { EventSubEvent, EventDeps } from '../types'
import { containsLink, isWhitelistedLink } from '@lib/utils'
import { log } from '@lib/services/logger'
import { isPermitted } from 'src/bot/commands/permit'
import type { ApiClient } from '@twurple/api'
import { config } from 'src/config/env'

const audioAlertUsers = new Set(['89181064', '537326154']) // remove 89181064 after testing

export default ({
    registry,
    apiClient,
    bot,
    say,
}: EventDeps): EventSubEvent => ({
    type: 'eventsub',
    name: 'onChatMessage',
    register({ eventSub, broadcasterId, botUserId, firstMessageTracker }) {
        eventSub.onChannelChatMessage(
            broadcasterId,
            botUserId,
            async (event) => {
                const { chatterId, messageText, chatterDisplayName } = event
                // handle commands first
                // REVIEW: should we time out users who post links in commands?
                registry.dispatch(event, apiClient)

                if (firstMessageTracker.isFirstMessage(chatterId)) {
                    log.bot.info(
                        `👋  First message from ${chatterDisplayName} this stream`,
                    )

                    if (audioAlertUsers.has(chatterId)) {
                        bot.emit('firstMessage', {
                            chatterId,
                            chatterName: chatterDisplayName,
                            message: messageText,
                            timestamp: new Date().toISOString(),
                        })
                    }
                }

                if (isTrustedUser(event)) return

                if (!containsLink(messageText)) return
                if (isWhitelistedLink(messageText)) return
                if (isPermitted(chatterId)) return

                moderate(apiClient, event, say)
            },
        )
    },
})

// REVIEW: don't allow subscribers to post links?
function isTrustedUser(event: EventSubChannelChatMessageEvent): boolean {
    const { chatterId, broadcasterId } = event

    if (chatterId === broadcasterId) return true

    return Object.keys(event.badges).some(
        (b) => b === 'moderator' || b === 'vip' || b === 'subscriber',
    )
}

async function moderate(
    apiClient: ApiClient,
    event: EventSubChannelChatMessageEvent,
    say: (channel: string, message: string) => Promise<void>,
) {
    const { chatterId, broadcasterId: channel, chatterDisplayName } = event

    apiClient.asUser(config.TWITCH_BOT_ID, async ({ moderation }) => {
        moderation.banUser(channel, {
            reason: 'timed out for posting links',
            user: chatterId,
            duration: 1_000,
        })
    })

    log.bot.info(`Timed out ${chatterDisplayName} for posting a link.`)

    say(
        config.TWITCH_BROADCASTER_ID,
        `@${chatterDisplayName} please don’t post links in chat!`,
    )
}
