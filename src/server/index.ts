// alerts.ts - pushes alerts from the bot to the overlay and serves the sound files.
// Put audio files in a `sounds/` folder next to this file.
import { join } from "node:path"

const port = Number(Bun.env.ALERT_PORT ?? 3001)
const soundsDir = join(import.meta.dir, "sounds")

export type Alert = { type: "first-message"; name: string; sound: string }

const server = Bun.serve({
    port,
    hostname: "0.0.0.0", // need to listen on all interfaces due to Docker
    async fetch(req, srv) {
        if (srv.upgrade(req)) return // overlay connecting over WebSocket

        const { pathname } = new URL(req.url)
        if (pathname.startsWith("/public/audio/")) {
            const name = decodeURIComponent(pathname.slice("/audio/".length))
            // plain file names only, so requests can't escape the sounds folder
            if (!/^[\w-][\w.-]*$/.test(name)) return new Response("Bad request", { status: 400 })
            const file = Bun.file(join(soundsDir, name))
            return (await file.exists()) ? new Response(file) : new Response("Not found", { status: 404 })
        }
        return new Response("Alert server running")
    },
    websocket: {
        open: (ws) => ws.subscribe("alerts"),
        message: () => {}, // the overlay only listens
    },
})

export const sendAlert = (alert: Alert) => server.publish("alerts", JSON.stringify(alert))

console.log(`Alert server listening on ws://127.0.0.1:${port}`)
