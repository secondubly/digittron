// Turns Twitch badge ids (e.g. "subscriber" / "12") into image URLs for the overlay.
import type { ApiClient } from '@twurple/api'
import { makeLogger } from '../../../core/logger'
import type { Badge } from '@core/chatEvents'

const log = makeLogger('badges')

// filter to only show these badges
const SHOWN = new Set([
    'broadcaster',
    'moderator',
    'lead_moderator',
    'vip',
    'subscriber',
    'founder',
    'bits',
    'sub-gifter',
    'partner',
    'staff',
])

let lookup = new Map<string, Badge>() // "set_id/version_id" -> image

async function load(api: ApiClient, broadcasterId: string) {
    const [global, channel] = await Promise.all([api.chat.getGlobalBadges(), api.chat.getChannelBadges(broadcasterId)])

    const next = new Map<string, Badge>()
    for (const set of [...global, ...channel]) {
        for (const version of set.versions) {
            // 1 is 18px image, 2 is the 36px image, 4 is 72px image
            next.set(`${set.id}/${version.id}`, { url: version.getImageUrl(2), title: version.title })
        }
    }
    lookup = next
    log.info({ badges: next.size }, 'badges loaded')
}

export async function startBadges(api: ApiClient, broadcasterId: string) {
    const refresh = () => load(api, broadcasterId).catch((err) => log.warn({ err }, 'could not load badges'))
    await refresh()
    // unref() allows program to exit even if this timer is still running
    setInterval(refresh, 60 * 60 * 1000).unref() // run every hour
}

/** badges is the { set_id: version_id } object from an EventSub chat event.
 * SEE: https://twurple.js.org/reference/eventsub-base/classes/EventSubChannelChatMessageEvent.html#badges
 */
export function resolveBadges(badges: Record<string, string>): Badge[] {
    const out: Badge[] = []
    for (const [set, version] of Object.entries(badges)) {
        if (!SHOWN.has(set)) continue
        const badge = lookup.get(`${set}/${version}`)
        if (badge) out.push(badge)
    }
    return out
}