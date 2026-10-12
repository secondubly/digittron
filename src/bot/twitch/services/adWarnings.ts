import type { ApiClient } from '@twurple/api'
import type { Bot } from '@twurple/easy-bot'
import type { EventSubWsListener } from '@twurple/eventsub-ws'
import { makeLogger } from '../../../core/logger'

const log = makeLogger('ads')

const WARNINGS = [
    { secondsBefore: 60, text: 'This is a message from the emergency bot system: ads will be run in 1 minute.' },
    { secondsBefore: 30, text: 'Ads will be starting in 30 seconds!' },
    { secondsBefore: 5, text: 'Ads will be starting in 5 seconds!' },
]
const AFTER_TEXT = 'You may now return to your regularly scheduled programming, thanks for sticking around!'

const POLL_MS = 15_000 // how often to re-read the schedule while live (it can change: snoozes, manual ads)
const RESCHEDULE_TOLERANCE_MS = 5_000 // ignore small shifts in the reported ad time
const END_BUFFER_MS = 3_000 // viewers can see the ad a little after the event fires

type TimerId = ReturnType<typeof setTimeout>

interface Options {
    bot: Bot
    api: ApiClient
    listener: EventSubWsListener
    ownerId: string
}

export async function startAdWarnings({ bot, api, listener, ownerId }: Options) {
    const owner = await api.users.getUserById(ownerId)
    if (!owner) throw new Error(`Could not find the owner account ${ownerId}`)
    const channel = owner.name // chat channel login

    let live = (await api.streams.getStreamByUserId(ownerId)) !== null
    let warningTimers: TimerId[] = []
    let endTimer: TimerId | undefined
    let scheduledFor: number | null = null // ms timestamp the current warnings are based on
    let failing = false

    const say = (text: string) => {
        bot.say(channel, text).catch((err) => log.warn({ err }, 'could not send ad message'))
    }

    const cancelWarnings = () => {
        for (const timer of warningTimers) clearTimeout(timer)
        warningTimers = []
        scheduledFor = null
    }

    const scheduleWarnings = (adAt: number) => {
        cancelWarnings()
        scheduledFor = adAt

        for (const { secondsBefore, text } of WARNINGS) {
            const delay = adAt - secondsBefore * 1000 - Date.now()
            if (delay <= 0) continue // that moment has already passed
            warningTimers.push(setTimeout(() => say(text), delay))
        }
        log.debug({ adAt: new Date(adAt).toISOString() }, 'ad warnings scheduled')
    }

    const poll = async () => {
        if (!live) return
        try {
            const schedule = await api.channels.getAdSchedule(ownerId)
            if (failing) {
                failing = false
                log.info('ad schedule is available again')
            }

            const next = schedule.nextAdDate?.getTime() ?? null
            if (!next || next <= Date.now()) return // nothing upcoming; leave any pending timers alone

            if (scheduledFor === null || Math.abs(next - scheduledFor) > RESCHEDULE_TOLERANCE_MS) {
                scheduleWarnings(next) // new ad time, or it moved (snooze, manual ad)
            }
        } catch (err) {
            // Twurple throws when Twitch returns no schedule (not live, or nothing scheduled) as well as on API errors
            if (!failing) {
                failing = true
                log.warn({ err }, 'ad schedule unavailable (not live, nothing scheduled, or missing channel:read:ads)')
            }
        }
    }

    // an ad break just began: drop warnings for it and time the "finished" message
    listener.onChannelAdBreakBegin(ownerId, (event) => {
        log.info({ seconds: event.durationSeconds, automatic: event.isAutomatic }, 'ad break started')
        cancelWarnings()

        const endsAt = event.startDate.getTime() + event.durationSeconds * 1000 + END_BUFFER_MS
        clearTimeout(endTimer)
        endTimer = setTimeout(() => {
            say(AFTER_TEXT)
            void poll() // pick up the next ad time straight away
        }, Math.max(0, endsAt - Date.now()))
    })

    listener.onStreamOnline(ownerId, () => {
        live = true
        void poll()
    })
    listener.onStreamOffline(ownerId, () => {
        live = false
        cancelWarnings()
        clearTimeout(endTimer)
    })

    const interval = setInterval(() => void poll(), POLL_MS)
    void poll()

    return () => {
        clearInterval(interval)
        cancelWarnings()
        clearTimeout(endTimer)
    }
}