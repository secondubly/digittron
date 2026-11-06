import type { EventSubWsListener } from '@twurple/eventsub-ws'
import type { ChatEvent, Fragment } from '@core/chatEvents'
import { broadcast } from '../web' // src/web/index.ts
import { resolveBadges } from '../bot/twitch/services/badges'

const TIERS: Record<string, string> = { '1000': 'Tier 1', '2000': 'Tier 2', '3000': 'Tier 3' }
const tierText = (tier: string) => (TIERS[tier] ? ` ${TIERS[tier]}` : '') // " Tier 1", or "" if unknown
const num = (n: number) => n.toLocaleString('en-US')

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

// The fields every chat notification has, whatever its type
interface NoticeLike {
  messageId: string
  broadcasterId: string
  broadcasterName: string
  chatterId: string
  chatterName: string
  chatterDisplayName: string
  chatterIsAnonymous: boolean
  color: string | null
  messageText: string
  messageParts: readonly RawFragment[]
  badges: Record<string, string>
}

type NoticeKind = 'sub' | 'gift' | 'raid'

function sendNotice(e: NoticeLike, kind: NoticeKind, headline: string, name?: string) {
  broadcast({
    type: 'chat',
    id: e.messageId,
    channel: e.broadcasterName,
    login: e.chatterName,
    userId: e.chatterId,
    name: name ?? (e.chatterIsAnonymous ? 'Anonymous' : e.chatterDisplayName),
    color: e.color ?? '',
    text: e.messageText,
    fragments: toFragments(e.messageParts),
    roomId: e.broadcasterId,
    badges: resolveBadges(e.badges),
    kind,
    headline,
  } satisfies ChatEvent)
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
      badges: resolveBadges(e.badges),
      kind: bits > 0 ? 'cheer' : 'chat',
      ...(bits > 0 ? { headline: `cheered ${num(bits)} bit${bits === 1 ? '' : 's'}` } : {}),
    } satisfies ChatEvent)
  })

  // subs, resubs, gifts and raids all arrive as chat notifications
  listener.onChannelChatNotification(broadcasterId, broadcasterId, (e) => {
    switch (e.type) {
      case 'sub': {
        const plan = e.isPrime ? ' Prime' : tierText(e.tier)
        sendNotice(e, 'sub', `subscribed${plan ? ` with${plan}` : ''}`)
        return
      }
      case 'resub': {
        const plan = e.isPrime ? ' Prime' : tierText(e.tier)
        const months = e.cumulativeMonths > 1 ? ` for ${e.cumulativeMonths} months` : ''
        const streak =
          e.streakMonths && e.streakMonths > 1 ? ` (${e.streakMonths} month streak)` : ''
        sendNotice(e, 'sub', `resubscribed${plan ? ` with${plan}` : ''}${months}${streak}`)
        return
      }
      case 'sub_gift': {
        // Part of a gift bomb? The community_sub_gift notice below already covers it,
        // so showing every recipient would flood the overlay.
        if (e.communityGiftId) return
        sendNotice(e, 'gift', `gifted a${tierText(e.tier)} sub to ${e.recipientDisplayName}`)
        return
      }
      case 'community_sub_gift': {
        const subs = e.amount === 1 ? 'sub' : 'subs'
        const total =
          e.cumulativeAmount && e.cumulativeAmount > e.amount
            ? ` (${num(e.cumulativeAmount)} gifted in total)`
            : ''
        sendNotice(
          e,
          'gift',
          `gifted ${num(e.amount)}${tierText(e.tier)} ${subs} to the community${total}`,
        )
        return
      }
      case 'raid': {
        const viewers = e.viewerCount === 1 ? 'viewer' : 'viewers'
        sendNotice(e, 'raid', `raided with ${num(e.viewerCount)} ${viewers}`, e.raiderDisplayName)
        return
      }
      default:
        return // announcements, charity donations and the rest are not shown
    }
  })

  listener.onChannelChatMessageDelete(broadcasterId, broadcasterId, (e) => {
    broadcast({ type: 'chat-remove', id: e.messageId } satisfies ChatEvent)
  })

  listener.onChannelChatClear(broadcasterId, broadcasterId, () => {
    broadcast({ type: 'chat-clear' } satisfies ChatEvent)
  })

  listener.onChannelChatClearUserMessages(broadcasterId, broadcasterId, (e) => {
    broadcast({ type: 'chat-clear', userId: e.userId } satisfies ChatEvent)
  })
}
