import { Database } from "bun:sqlite"
import type { ApiClient } from "@twurple/api"
import type { Bot } from "@twurple/easy-bot"
import type { EventSubWsListener } from "@twurple/eventsub-ws"
import { sendAlert } from "../../../web/alerts"

type Options = {
    bot: Bot
    api: ApiClient
    listener: EventSubWsListener
    broadcasterId: string
    ignoreUserIds?: string[]
    onFirstMessage?: (user: { id: string; name: string }, streamId: string) => void | Promise<void>
}

export async function trackFirstMessages({
    bot, api, listener, broadcasterId, ignoreUserIds = [], onFirstMessage,
}: Options) {
    const db = new Database("./data/data.db")
    db.run(`
        CREATE TABLE IF NOT EXISTS stream_chatters (
            stream_id TEXT NOT NULL,
            user_id   TEXT NOT NULL,
            user_name TEXT NOT NULL,
            first_at  INTEGER NOT NULL,
            PRIMARY KEY (stream_id, user_id)
        )
    `)
    const insert = db.prepare(
        "INSERT OR IGNORE INTO stream_chatters (stream_id, user_id, user_name, first_at) VALUES (?, ?, ?, ?)",
    )

    const ignored = new Set(ignoreUserIds)
    const seen = new Set<string>() // cache so most messages never touch the database
    const hasAudio = new Set<string>('537326154')
    let streamId: string | null = null

    const setStream = (id: string | null) => {
        streamId = id
        seen.clear()
    }

    // If the bot starts mid-stream, pick up the current stream
    setStream((await api.streams.getStreamByUserId(broadcasterId))?.id ?? null)

    listener.onStreamOnline(broadcasterId, (e) => setStream(e.id))
    listener.onStreamOffline(broadcasterId, () => setStream(null))

    bot.onMessage(async ({ userId, userName }) => {
        const sid = streamId
        // TODO: add serybot, and nightbot to the ignore list
        if (!sid || ignored.has(userId) || seen.has(userId)) return
        seen.add(userId)

        if (hasAudio.has(userId)) {
            sendAlert({
                type: "first-message",
                name: userId,
                sound: `${userId}.mp3`
            }, Bun.env.ALERT_PORT ?? '3000')
        }

        // changes === 1 only if this (stream, user) pair wasn't already recorded
        const result = insert.run(sid, userId, userName, Date.now())
        if (result.changes > 0) await onFirstMessage?.({ id: userId, name: userName }, sid)
    })
}