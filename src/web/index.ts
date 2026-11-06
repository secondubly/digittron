import { join } from 'node:path'
import type { Alert } from './alerts'
import { apiRoutes } from '../api'
import { log } from '@core/logger'
import { onShutdown } from '@core/shutdown'
import { getLeaderboard } from '../bot/twitch/services/firsts'
import { serveStatic } from '@core/utils'

const port = Number(Bun.env.WEB_PORT ?? 3000)
const SOUNDS_PREFIX = Bun.env.NODE_ENV !== 'production' ? '/public/audio/' : '/audio'
const soundsDir = join(import.meta.dir, SOUNDS_PREFIX)

let server: ReturnType<typeof Bun.serve> | null = null

// internally handle sending alerts
export function broadcast(event: unknown) {
  server?.publish('alerts', JSON.stringify(event))
}

async function handleStatic(req: Request) {
  const { pathname } = new URL(req.url)
  const response = await serveStatic(pathname)
  if (response) return response
}

export function buildServer(port: number) {
  server = Bun.serve<undefined>({
    port,
    // runs for requests that no route matched
    async fetch(req, srv) {
      const { pathname } = new URL(req.url)

      // handle websocket upgrades
      if (pathname === '/ws') {
        const upgraded = srv.upgrade(req)
        if (!upgraded) {
          return new Response('Upgrade failed', { status: 400 })
        }
      } else {
        return new Response('Not found', { status: 404 })
      }
    },
    websocket: {
      open(ws) {
        ws.subscribe('alerts')
        log.web.info('Client connected')
      }, // on connection, subscribe to the alerts event
      message: () => {}, // no-op, overlay only listens
    },
    routes: {
      '/': {
        GET: handleStatic,
        HEAD: handleStatic, // see: https://http.dev/head for info on what HEAD is used for
      },
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
      '/api/firsts': () => Response.json(getLeaderboard(10)),
      '/api/alert': {
        POST: async (req: Request) => {
          try {
            const alertData = (await req.json()) as Alert
            broadcast(alertData)
            return new Response('Alert broadcasted', { status: 200 })
          } catch (_e) {
            return new Response('Invalid JSON payload', { status: 400 })
          }
        },
      },
      '/public/audio': {
        GET: async (req: Request) => {
          const { pathname } = new URL(req.url)
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
        },
      },
      // quotes endpoints
      '/api/quotes/random': () => apiRoutes.getRandomQuote(),
      '/api/quotes/:id': {
        GET: (req: Request, params: { id: string }) => apiRoutes.getQuoteById(req, params.id),
        DELETE: (req: Request, params: { id: string }) => apiRoutes.deleteQuote(req, params.id),
      },
      '/api/quotes': {
        GET: (req: Request) => apiRoutes.searchQuote(req),
        POST: (req: Request) => apiRoutes.addQuote(req),
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
