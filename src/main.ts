import { init as buildServer } from './server/startup.js'
import { init as webInit } from './web/index.js'
import { log } from '@core/utils/logger.js'
import { config } from '@core/config/env.js'

// server controls bot as well
const main = async () => {
  const server = await buildServer()
  try {
    if (process.stdout.isTTY || config.NODE_ENV === 'development') {
      server.log.info('Server running in development mode')
      server.listen({
        port: (process.env.API_PORT as unknown as number) ?? 4001,
      })
      // start web server if we're in dev mode
      webInit((process.env.WEB_PORT as unknown as number) ?? 50001)
    } else {
      server.listen({
        port: (process.env.API_PORT as unknown as number) ?? 4001,
        host: '0.0.0.0',
      })
    }
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

main().catch((err) => {
  log.app.error(`Failed to start app: `, err)
})
