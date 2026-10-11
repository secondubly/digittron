import type { Msg, Part } from '../types'

const emote = (id: string, alt: string): Part => ({
    src: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/2.0`,
    alt,
})

const KAPPA = emote('25', 'Kappa')
const LUL = emote('425618', 'LUL')

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
    ...extra,
})

/** One of every message type, including the awkward cases that break layouts. */
export function fixtures(): Msg[] {
    return [
        msg('Streamer', '#ff4d4d', ['Short message']),
        msg('LongNameWithManyCharacters_123', '#00bfa5', [
            'A much longer message that has to wrap across several lines, so you can check how the panel, ' +
                'padding and line height behave when text runs right up to the edge of the overlay.',
        ]),
        msg('EmoteSpammer', '#9146ff', [KAPPA, ' ', KAPPA, ' ', LUL, ' nice one ', LUL]),
        msg('NoSpaces', '#ffa94d', ['Supercalifragilisticexpialidocious'.repeat(4)]),
        msg('Waving', '#4dabf7', ['waves at everyone'], { action: true }),
        msg('日本語ユーザー', '#69db7c', ['こんにちは、みなさん！ 今日も配信ありがとう']),
        msg('BigSpender', '#f6c445', ['Take my bits!'], { kind: 'cheer', headline: 'cheered 1,000 bits' }),
        msg('NewSub', '#a970ff', [], { kind: 'sub', headline: 'subscribed with Tier 1' }),
        msg('LoyalFan', '#f783ac', ['Still here after all this time ', KAPPA], {
            kind: 'sub',
            headline: 'resubscribed with Tier 1 for 24 months (12 month streak)',
        }),
    ]
}

/** A random fixture with a fresh id and timestamp, for a continuous stream of messages. */
export function randomMessage(): Msg {
    const all = fixtures()
    return all[Math.floor(Math.random() * all.length)] as Msg
}