import type { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'

export const isTrustedUser = (event: EventSubChannelChatMessageEvent) => {
    const { chatterId, broadcasterId } = event

    if (chatterId === broadcasterId) return true

    return Object.keys(event.badges).some(
        (b) => b === 'moderator' || b === 'subscriber',
    )
}
