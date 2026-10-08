import { join } from 'node:path'
import homepage from './index.html'
import type { Alert } from './alerts'
import { apiRoutes } from '../api'
import { log } from '@core/logger'
import { onShutdown } from '@core/shutdown'

const port = Number(Bun.env.WEB_PORT ?? 3000)
const SOUNDS_PREFIX = '/public/audio/'
const soundsDir = join(import.meta.dir, SOUNDS_PREFIX)

let server: ReturnType<typeof Bun.serve> | null = null

// internally handle sending alerts
function broadcastAlert(alert: Alert) {
  if (!server) return
  server.publish('alerts', JSON.stringify(alert))
  log.web.info({ alert: alert }, 'Alert published to clients')
}

export function buildServer(port: number) {
  server = Bun.serve<undefined>({
    port,
    hostname: '0.0.0.0', // need to listen on all interfaces due to Docker
    async fetch(req, srv) {
      if (srv.upgrade(req)) return // overlay connecting over WebSocket

      const { pathname } = new URL(req.url)
      // Handle incoming alert POST requests from the bot
      if (req.method === 'POST' && pathname.startsWith('/api/alert')) {
        try {
          const alertData = (await req.json()) as Alert
          broadcastAlert(alertData)
          return new Response('Alert broadcasted', { status: 200 })
        } catch (_e) {
          return new Response('Invalid JSON payload', { status: 400 })
        }
      }

      // serve static audio assets
      if (pathname.startsWith(SOUNDS_PREFIX)) {
        let name: string
        try {
          name = decodeURIComponent(pathname.slice(SOUNDS_PREFIX.length))
        } catch {
          return new Response('Bad request', { status: 400 })
        }
        // plain file names only, so requests can't escape the sounds folder
        if (!/^[\w-][\w.-]*$/.test(name)) return new Response('Bad request', { status: 400 })
        const file = Bun.file(join(soundsDir, name))
        return (await file.exists())
          ? new Response(file)
          : new Response('Not found', { status: 404 })
      }
      return new Response('Alert server running')
    },
    websocket: {
      open(ws) {
        ws.subscribe('alerts')
      }, // on connection, subscribe to the alerts event
      message: () => {}, // no-op, overlay only listens
    },
    routes: {
      '/': homepage,
      '/api/spotify/now-playing': async (req: Request) => {
        const response = await apiRoutes.getNowPlaying(req)

        if (!response.data) {
          if (response.status === 204) {
            return new Response(null, { status: response.status })
          } else {
            return new Response('Something went wrong', { status: response.status })
          }
        } else {
          return Response.json(response.data, { status: 200 })
        }
      },
    },
  })

  log.web.info(`Alert server listening on ${server.hostname}:${server.port}`)

  onShutdown('server-close', async () => {
    if (!server) return
    log.web.info('Shutting down web server gracefully')
    await server.stop()
    log.web.info('Web server shut down.')
  })

  return server
}

if (import.meta.main) {
  buildServer(port)
}
