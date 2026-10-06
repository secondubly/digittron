import { StrictMode, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

type Part = string | { src: string; alt: string }
type Msg = {
    id: string
    userId: string
    name: string
    color: string
    action: boolean
    parts: Part[]
    at: number
}

const params = new URLSearchParams(location.search)
const channel = (params.get("channel") ?? "").toLowerCase()
const ttl = Number(params.get("ttl") ?? 30) * 1000
const max = Number(params.get("max") ?? 12)
const hide = new Set((params.get("hide") ?? "").toLowerCase().split(",").filter(Boolean))
document.documentElement.style.setProperty("--size", `${params.get("size") ?? 22}px`)

const FALLBACK_COLORS = ["#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#38d9a9", "#4dabf7", "#9775fa", "#f783ac"]
const fallbackColor = (name: string) => {
    let h = 0
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
    return FALLBACK_COLORS[h % FALLBACK_COLORS.length]
}

// IRC line -> tags + command + channel + text
function parseLine(raw: string) {
    let line = raw
    const tags: Record<string, string> = {}
    if (line.startsWith("@")) {
        const end = line.indexOf(" ")
        for (const kv of line.slice(1, end).split(";")) {
            const [k, v = ""] = kv.split("=")
            tags[k] = v
        }
        line = line.slice(end + 1)
    }
    const m = /^(?::(\S+) )?(\S+)(?: (\S+))?(?: :?(.*))?$/.exec(line)
    return { tags, prefix: m?.[1] ?? "", command: m?.[2] ?? "", target: m?.[3] ?? "", text: m?.[4] ?? "" }
}

function buildParts(text: string, emotesTag: string): Part[] {
    if (!emotesTag) return [text]
    const chars = Array.from(text)
    const ranges: [number, number, string][] = []
    for (const group of emotesTag.split("/")) {
        const [id, positions] = group.split(":")
        for (const range of positions.split(",")) {
            const [s, e] = range.split("-").map(Number)
            ranges.push([s, e, id])
        }
    }
    ranges.sort((a, b) => a[0] - b[0])
    const parts: Part[] = []
    let cur = 0
    for (const [s, e, id] of ranges) {
        if (s > cur) parts.push(chars.slice(cur, s).join(""))
        parts.push({
            src: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/2.0`,
            alt: chars.slice(s, e + 1).join(""),
        })
        cur = e + 1
    }
    if (cur < chars.length) parts.push(chars.slice(cur).join(""))
    return parts
}

// Third-party emotes (7TV / BTTV): word -> image URL. Later sets override earlier ones.
const providers = new Set((params.get("emotes") ?? "7tv,bttv").toLowerCase().split(","))
const thirdParty = new Map<string, string>()
let loadedRoom = ""

const getJson = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${url} -> ${res.status}`)
    return res.json()
}
const bttvUrl = (id: string) => `https://cdn.betterttv.net/emote/${id}/2x.webp`
const stvUrl = (id: string) => `https://cdn.7tv.app/emote/${id}/2x.webp`
type Pair = [word: string, url: string]

async function loadThirdParty(roomId: string) {
    if (!roomId || roomId === loadedRoom) return
    loadedRoom = roomId

    const jobs: Promise<Pair[]>[] = []
    if (providers.has("bttv")) {
        jobs.push(
            getJson("https://api.betterttv.net/3/cached/emotes/global").then((list: any[]) =>
                list.map((e): Pair => [e.code, bttvUrl(e.id)]),
            ),
            getJson(`https://api.betterttv.net/3/cached/users/twitch/${roomId}`).then((u: any) =>
                [...(u.channelEmotes ?? []), ...(u.sharedEmotes ?? [])].map((e): Pair => [e.code, bttvUrl(e.id)]),
            ),
        )
    }
    if (providers.has("7tv")) {
        jobs.push(
            getJson("https://7tv.io/v3/emote-sets/global").then((s: any) =>
                (s.emotes ?? []).map((e: any): Pair => [e.name, stvUrl(e.id)]),
            ),
            getJson(`https://7tv.io/v3/users/twitch/${roomId}`).then((u: any) =>
                (u.emote_set?.emotes ?? []).map((e: any): Pair => [e.name, stvUrl(e.id)]),
            ),
        )
    }

    // One failing provider shouldn't break the others
    for (const r of await Promise.allSettled(jobs)) {
        if (r.status === "fulfilled") for (const [word, url] of r.value) thirdParty.set(word, url)
        else console.warn("Emote list failed to load:", r.reason)
    }
}

// Swap whole words that match a 7TV/BTTV emote name for an image
function expandThirdParty(parts: Part[]): Part[] {
    if (!thirdParty.size) return parts
    return parts.flatMap((p) =>
        typeof p !== "string"
            ? [p]
            : p.split(/(\s+)/).map((tok): Part => {
                  const src = thirdParty.get(tok)
                  return src ? { src, alt: tok } : tok
              }),
    )
}

function useChat(): Msg[] {
    const [messages, setMessages] = useState<Msg[]>([])

    useEffect(() => {
        if (!channel) return
        let ws: WebSocket
        let timer: number
        let attempts = 0
        let closed = false

        const connect = () => {
            ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443")
            ws.onopen = () => {
                attempts = 0
                ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands")
                ws.send("PASS SCHMOOPIIE")
                ws.send(`NICK justinfan${Math.floor(Math.random() * 80000) + 1000}`)
                ws.send(`JOIN #${channel}`)
            }
            ws.onmessage = (ev) => {
                for (const raw of String(ev.data).split("\r\n").filter(Boolean)) {
                    if (raw.startsWith("PING")) {
                        ws.send("PONG :tmi.twitch.tv")
                        continue
                    }
                    const { tags, prefix, command, text } = parseLine(raw)
                    if (tags["room-id"]) void loadThirdParty(tags["room-id"]) // no-op after the first call

                    if (command === "PRIVMSG") {
                        const login = prefix.split("!")[0]
                        let body = text
                        const action = body.startsWith("\u0001ACTION ")
                        if (action) body = body.slice(8, -1)
                        if (hide.has(login) || body.startsWith("!")) continue
                        const name = tags["display-name"] || login
                        const msg: Msg = {
                            id: tags["id"] || crypto.randomUUID(),
                            userId: tags["user-id"] ?? "",
                            name,
                            color: tags["color"] || fallbackColor(name),
                            action,
                            parts: expandThirdParty(buildParts(body, tags["emotes"] ?? "")),
                            at: Date.now(),
                        }
                        setMessages((prev) => [...prev, msg].slice(-max))
                    } else if (command === "CLEARCHAT") {
                        const target = tags["target-user-id"]
                        setMessages((prev) => (target ? prev.filter((m) => m.userId !== target) : []))
                    } else if (command === "CLEARMSG") {
                        setMessages((prev) => prev.filter((m) => m.id !== tags["target-msg-id"]))
                    }
                }
            }
            ws.onclose = () => {
                if (!closed) timer = window.setTimeout(connect, Math.min(1000 * 2 ** attempts++, 15000))
            }
        }

        connect()
        return () => {
            closed = true
            clearTimeout(timer)
            // Closing mid-handshake logs a browser warning, so wait for open first
            if (ws.readyState === WebSocket.CONNECTING) ws.onopen = () => ws.close()
            else ws.close()
        }
    }, [])

    // Expire old messages
    useEffect(() => {
        if (!ttl) return
        const t = setInterval(() => {
            const cutoff = Date.now() - ttl
            setMessages((prev) => (prev.some((m) => m.at < cutoff) ? prev.filter((m) => m.at >= cutoff) : prev))
        }, 1000)
        return () => clearInterval(t)
    }, [])

    return messages
}

function Message({ msg }: { msg: Msg }) {
    const body = msg.parts.map((p, i) =>
        typeof p === "string" ? (
            <span key={i}>{p}</span>
        ) : (
            <img
                key={i}
                className="emote"
                alt={p.alt}
                src={p.src}
            />
        ),
    )
    return (
        <div className={`msg${msg.action ? " action" : ""}`} style={{ ["--c" as string]: msg.color }}>
            <span className="name">{msg.name}</span>
            <span className="text">{body}</span>
        </div>
    )
}

function App() {
    const messages = useChat()
    if (!channel) {
        return <div className="chat"><div className="msg">Add ?channel=yourchannel to the URL.</div></div>
    }
    return (
        <div className="chat">
            {messages.map((m) => (
                <Message key={m.id} msg={m} />
            ))}
        </div>
    )
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
