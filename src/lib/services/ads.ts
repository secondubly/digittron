import type { HelixAdSchedule } from '@twurple/api'

const LEAD_TIME_MS = 60000 // 60 secs in milliseconds

let scheduledTimer: NodeJS.Timeout | null = null
let pollInterval: NodeJS.Timeout | null = null

async function getAdSchedule() {
    const adsOptions = {
        url: `https://api.twitch.tv/helix/channels/ads?broadcaster_id=${process.env.TWITCH_ID}`,
        headers: {
            'Client-ID': process.env.CLIENT_ID ?? '',
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
    }
    const res = await fetch(adsOptions.url, {
        headers: adsOptions.headers,
    })

    if (!res.ok) throw new Error(`Twitch API error: ${res.status}`)

    const data = (await res.json()) as HelixAdSchedule[]
    return data?.[0] ?? null // { next_ad_at, duration, preroll_free_time, ... }
}

function scheduleWarning(nextAdAt: number) {
    if (scheduledTimer) clearTimeout(scheduledTimer)

    const nextAdMs = new Date(nextAdAt).getTime()
    const warnAt = nextAdMs - LEAD_TIME_MS
    const delayMs = warnAt - Date.now()

    if (delayMs <= 0) {
        // ad is imminent or already passed, skip
        return
    }

    console.log(`⏰  Warning scheduled in ${Math.round(delayMs / 1000)}s`)

    scheduledTimer = setTimeout(() => {
        onAdWarning(nextAdAt)
    }, delayMs)
}

function onAdWarning(nextAdAt: number) {
    const secsUntil = Math.round(
        (new Date(nextAdAt).getTime() - Date.now()) / 1000,
    )
    console.log(`📢  Ad break in ~${secsUntil}s — do something!`)

    // e.g. send a chat message via your bot:
    // chat.say(channel, `📢 Ad break in ${secsUntil} seconds!`);
}

async function poll() {
    try {
        const schedule = await getAdSchedule()

        if (!schedule?.nextAdDate) {
            console.log('No upcoming ad scheduled.')
            return
        }

        console.log(
            `next_ad_at: ${schedule.nextAdDate} | duration: ${schedule.duration}s`,
        )
        scheduleWarning(schedule.nextAdDate.getTime())
    } catch (err) {
        console.error('Poll error:', err.message)
    }
}

export function startAdPoller() {
    poll() // run immediately
    pollInterval = setInterval(poll, 5 * 60_000) // then every 5 minutes
}

export function stopAdPoller() {
    clearInterval(pollInterval!)
    clearTimeout(scheduledTimer!)
}
