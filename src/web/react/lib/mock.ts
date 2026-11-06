import type { Badge } from '@core/chatEvents'
import type { Msg, Part } from '../types'

const emote = (id: string, alt: string): Part => ({
  src: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/2.0`,
  alt,
})

const KAPPA = emote('25', 'Kappa')
const LUL = emote('425618', 'LUL')

const badge = (title: string, color: string, glyph: string): Badge => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">` +
    `<rect width="36" height="36" rx="6" fill="${color}"/>` +
    `<text x="18" y="25" font-size="20" font-family="sans-serif" font-weight="700" ` +
    `text-anchor="middle" fill="#fff">${glyph}</text></svg>`
  return { title, url: `data:image/svg+xml,${encodeURIComponent(svg)}` }
}

const BROADCASTER = badge('Broadcaster', '#e91916', 'B')
const MODERATOR = badge('Moderator', '#00ad03', 'M')
const VIP = badge('VIP', '#e005b9', 'V')
const SUBSCRIBER = badge('Subscriber', '#9146ff', 'S')
const BITS = badge('Cheer 1000', '#2a9bd7', '$')

let counter = 0

const msg = (name: string, color: string, parts: Part[], extra: Partial<Msg> = {}): Msg => ({
  id: `mock-${++counter}`,
  userId: String(counter),
  name,
  color,
  action: false,
  parts,
  at: Date.now(),
  kind: 'chat',
  badges: [],
  ...extra,
})

/** One of every message type, including the awkward cases that break layouts. */
export function fixtures(): Msg[] {
  return [
    msg('Streamer', '#ff4d4d', ['Short message'], { badges: [BROADCASTER] }),
    msg(
      'LongNameWithManyCharacters_123',
      '#00bfa5',
      [
        'A much longer message that has to wrap across several lines, so you can check how the panel, ' +
          'padding and line height behave when text runs right up to the edge of the overlay.',
      ],
      { badges: [MODERATOR, SUBSCRIBER, BITS] },
    ),
    msg('EmoteSpammer', '#9146ff', [KAPPA, ' ', KAPPA, ' ', LUL, ' nice one ', LUL], {
      badges: [SUBSCRIBER],
    }),
    msg('NoSpaces', '#ffa94d', ['Supercalifragilisticexpialidocious'.repeat(4)]),
    msg('Waving', '#4dabf7', ['waves at everyone'], { action: true, badges: [VIP] }),
    msg('日本語ユーザー', '#69db7c', ['こんにちは、みなさん！ 今日も配信ありがとう']),
    msg('BadgeHoarder', '#f783ac', ['wearing every badge at once'], {
      badges: [BROADCASTER, MODERATOR, VIP, SUBSCRIBER, BITS],
    }),
    msg('BigSpender', '#f6c445', ['Take my bits!'], {
      kind: 'cheer',
      headline: 'cheered 1,000 bits',
      badges: [BITS],
    }),
    msg('NewSub', '#a970ff', [], {
      kind: 'sub',
      headline: 'subscribed with Tier 1',
      badges: [SUBSCRIBER],
    }),
    msg('LoyalFan', '#f783ac', ['Still here after all this time ', KAPPA], {
      kind: 'sub',
      headline: 'resubscribed with Tier 1 for 24 months (12 month streak)',
      badges: [SUBSCRIBER, VIP],
    }),
    msg('Generous', '#ff6aa2', [], {
      kind: 'gift',
      headline: 'gifted a Tier 1 sub to NewSub',
      badges: [SUBSCRIBER],
    }),
    msg('GiftBomber', '#ff6aa2', [], {
      kind: 'gift',
      headline: 'gifted 50 Tier 1 subs to the community (150 gifted in total)',
      badges: [SUBSCRIBER, BITS],
    }),
    msg('BigStreamer', '#ff8a3d', [], {
      kind: 'raid',
      headline: 'raided with 1,234 viewers',
      badges: [BROADCASTER],
    }),
  ]
}

/** A random fixture with a fresh id and timestamp, for a continuous stream of messages. */
export function randomMessage(): Msg {
  const all = fixtures()
  return all[Math.floor(Math.random() * all.length)] as Msg
}
