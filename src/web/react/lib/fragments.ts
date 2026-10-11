
import type { Fragment } from '@core/chatEvents'
import type { Part } from '../types'

const emoteUrl = (id: string) => `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/2.0`

// Twitch's cheermote CDN. The path comes from Twitch's cheermote docs; check it still resolves.
const cheermoteUrl = (prefix: string, tier: number) =>
    `https://d3aqoihi2n8ty8.cloudfront.net/actions/${encodeURIComponent(prefix.toLowerCase())}/dark/animated/${tier}/2.gif`

export function fragmentsToParts(fragments: Fragment[]): Part[] {
    return fragments.map((f): Part => {
        switch (f.type) {
            case 'emote':
                return { src: emoteUrl(f.id), alt: f.text }
            case 'cheermote':
                return { src: cheermoteUrl(f.prefix, f.tier), alt: f.text }
            default:
                return f.text
        }
    })
}
