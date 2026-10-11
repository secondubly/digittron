// Subscribes to Twitch EventSub chat topics and forwards them to overlay clients over the
// bot's WebSocket server. The EventSub connection (and its token) stays on the server.
import type { EventSubWsListener } from '@twurple/eventsub-ws'
import type { ChatEvent, Fragment } from './chatEvents'
import { broadcast } from '../web'

const TIERS: Record<string, string> = { '1000': 'Tier 1', '2000': 'Tier 2', '3000': 'Tier 3' }

// The parts of an EventSub message fragment we read
interface RawFragment {
    type: string
    text: string
    emote?: { id: string }
    cheermote?: { prefix: string; tier: number }
}

function toFragments(parts: readonly RawFragment[]): Fragment[] {
    return parts.map((p): Fragment => {
        if (p.type === 'emote' && p.emote) return { type: 'emote', text: p.text, id: p.emote.id }
        if (p.type === 'cheermote' && p.cheermote) {
            return { type: 'cheermote', text: p.text, prefix: p.cheermote.prefix, tier: p.cheermote.tier }
        }
        return { type: 'text', text: p.text }
    })
}

/**
 * `broadcasterId` is the channel to read. The same user's token does the reading, so that token
 * needs the `user:read:chat` scope. A user token can also read other channels' chat: pass a
 * different broadcaster id as the first argument of each call below.
 */
export function relayChat(listener: EventSubWsListener, broadcasterId: string) {
    listener.onChannelChatMessage(broadcasterId, broadcasterId, (e) => {
        const bits = e.bits
        broadcast({
            type: 'chat',
            id: e.messageId,
            channel: e.broadcasterName,
            login: e.chatterName,
            userId: e.chatterId,
            name: e.chatterDisplayName,
            color: e.color ?? '',
            text: e.messageText,
            fragments: toFragments(e.messageParts),
            roomId: e.broadcasterId,
            kind: bits > 0 ? 'cheer' : 'chat',
            ...(bits > 0 ? { headline: `cheered ${bits.toLocaleString('en-US')} bit${bits === 1 ? '' : 's'}` } : {}),
        } satisfies ChatEvent)
    })

    // subs and resubs arrive as chat notifications
    listener.onChannelChatNotification(broadcasterId, broadcasterId, (e) => {
        if (e.type !== 'sub' && e.type !== 'resub') return // gifts, raids and the rest are ignored for now

        const plan = e.isPrime ? 'Prime' : TIERS[e.tier]
        const withPlan = plan ? ` with ${plan}` : ''

        let headline = `subscribed${withPlan}`
        if (e.type === 'resub') {
            const months = e.cumulativeMonths > 1 ? ` for ${e.cumulativeMonths} months` : ''
            const streak = e.streakMonths && e.streakMonths > 1 ? ` (${e.streakMonths} month streak)` : ''
            headline = `resubscribed${withPlan}${months}${streak}`
        }

        broadcast({
            type: 'chat',
            id: e.messageId,
            channel: e.broadcasterName,
            login: e.chatterName,
            userId: e.chatterId,
            name: e.chatterDisplayName,
            color: e.color ?? '',
            text: e.messageText,
            fragments: toFragments(e.messageParts),
            roomId: e.broadcasterId,
            kind: 'sub',
            headline,
        } satisfies ChatEvent)
    })

    // moderation: keep the overlay in step with what mods remove
    listener.onChannelChatMessageDelete(broadcasterId, broadcasterId, (e) => {
        broadcast({ type: 'chat-remove', id: e.messageId } satisfies ChatEvent)
    })
    listener.onChannelChatClear(broadcasterId, broadcasterId, () => {
        broadcast({ type: 'chat-clear' } satisfies ChatEvent)
    })
    // fires for bans and timeouts as well
    listener.onChannelChatClearUserMessages(broadcasterId, broadcasterId, (e) => {
        broadcast({ type: 'chat-clear', userId: e.userId } satisfies ChatEvent)
    })
}
