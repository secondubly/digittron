import { join } from "node:path"

const port = Number(Bun.env.ALERT_PORT ?? 3001)
const SOUNDS_PREFIX = "/public/audio/"
const soundsDir = join(import.meta.dir, SOUNDS_PREFIX)

export type Alert = { type: "first-message"; name: string; sound: string }
let server: ReturnType<typeof Bun.serve> | null = null

// internally handle sending alerts
function broadcastAlert(alert: Alert) {
    if (!server) return;
    server.publish("alerts", JSON.stringify(alert));
    console.log("Alert published to clients:", alert);
}

export function buildServer() {
    server = Bun.serve({
        port,
        hostname: "0.0.0.0", // need to listen on all interfaces due to Docker
        async fetch(req, srv) {
            if (srv.upgrade(req)) return // overlay connecting over WebSocket

            const { pathname } = new URL(req.url)
            // 🚨 NEW: Handle incoming alert POST requests from the bot process
            if (req.method === "POST" && pathname.startsWith("/api/alert")) {
                try {
                    const alertData = await req.json() as Alert;
                    broadcastAlert(alertData);
                    return new Response("Alert broadcasted", { status: 200 });
                } catch (_e) {
                    return new Response("Invalid JSON payload", { status: 400 });
                }
            }

            // serve static audio assets
            if (pathname.startsWith(SOUNDS_PREFIX)) {
                let name: string
                try {
                    name = decodeURIComponent(pathname.slice(SOUNDS_PREFIX.length))
                } catch {
                    return new Response("Bad request", { status: 400 })
                }
                // plain file names only, so requests can't escape the sounds folder
                if (!/^[\w-][\w.-]*$/.test(name)) return new Response("Bad request", { status: 400 })
                const file = Bun.file(join(soundsDir, name))
                return (await file.exists()) ? new Response(file) : new Response("Not found", { status: 404 })
            }
            return new Response("Alert server running")
        },
        websocket: {
            open: (ws) => ws.subscribe("alerts"), // on connection, subscribe to the alerts event
            message: () => {}, // the overlay only listens
        },
    })

    console.log(`Alert server listening on ${server.hostname}:${server.port}`)
    return server
}

export const sendAlert = async (alert: Alert) => {
    // the bot is running via a different process so we need to have a way for it to 
    // connect to the server, we can't access it directly
    try {
        const response = await fetch(`http://localhost:${port}/api/alert`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alert),
        });
        if (!response.ok) {
            console.error(`Failed to send alert. Server status: ${response.status}`);
        }
    } catch (error) {
        console.error("Failed to connect to the alert server from the bot process:", error);
    }
};