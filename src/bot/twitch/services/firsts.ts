import type { ApiClient } from '@twurple/api'
import type { EventSubWsListener } from '@twurple/eventsub-ws'
import { log } from '@core/logger'
import { db } from '@core/db'

const upsert = db.prepare(`
    INSERT INTO first_redemptions
        (id, stream_id, stream_started_at, user_id, user_name, display_name, status, redeemed_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at
`)

interface RedemptionEvent {
    id: string
    userId: string
    userName: string
    userDisplayName: string
    status: string
    redemptionDate: Date
}

interface TrackOptions {
    api: ApiClient
    listener: EventSubWsListener
    broadcasterId: string
    rewardId: string
    /** Called after every change, e.g. to tell the leaderboard page to refresh. */
    onChange?: () => void
}

export function trackFirsts({ api, listener, broadcasterId, rewardId, onChange }: TrackOptions) {
    const save = (e: RedemptionEvent, stream: { id: string; startDate: Date } | null) => {
        upsert.run(
            e.id,
            stream?.id ?? null,
            stream?.startDate.getTime() ?? null,
            e.userId,
            e.userName,
            e.userDisplayName,
            e.status,
            e.redemptionDate.getTime(),
            Date.now(),
        )
        onChange?.()
    }

    // a new claim: note which stream it belongs to
    listener.onChannelRedemptionAddForReward(broadcasterId, rewardId, async (e) => {
        const stream = await api.streams.getStreamByUserId(broadcasterId).catch((err) => {
            log.twitch.warn({ err }, 'could not look up the current stream')
            return null
        })
        save(e, stream)
        log.twitch.info({ user: e.userName, status: e.status, streamId: stream?.id }, 'first claimed')
    })

    // fulfilled or canceled (refunded): only the status changes, the stream info stays as inserted
    listener.onChannelRedemptionUpdateForReward(broadcasterId, rewardId, (e) => {
        save(e, null)
        log.twitch.info({ user: e.userName, status: e.status }, 'first status changed')
    })
}

export interface LeaderboardRow {
    userId: string
    name: string
    firsts: number
    lastAt: number
}

/**
 * Most claims first. Refunded claims don't count. Ties go to whoever reached that
 * count earliest, i.e. the older latest claim. The name shown is from their most recent claim.
 */
export function getLeaderboard(limit = 10): LeaderboardRow[] {
    return db
        .query(
            `SELECT user_id AS userId, display_name AS name, COUNT(*) AS firsts, MAX(redeemed_at) AS lastAt
             FROM first_redemptions
             WHERE status != 'canceled'
             GROUP BY user_id
             ORDER BY firsts DESC, lastAt ASC
             LIMIT ?`,
        )
        .all(limit) as LeaderboardRow[]
}

export function getUserFirsts(userId: string): number {
    const row = db
        .query(`SELECT COUNT(*) AS n FROM first_redemptions WHERE user_id = ? AND status != 'canceled'`)
        .get(userId) as { n: number } | null
    return row?.n ?? 0
}