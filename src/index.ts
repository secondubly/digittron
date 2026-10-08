import { startBot } from './bot/twitch'
import { db } from './bot/twitch/services/db'
import { log } from '@core/logger'
import { buildServer } from './web'
import { setupShutdownHandlers } from '@core/shutdown'

const startup = () => {
  try {
    setupShutdownHandlers()
    
    startBot()
    buildServer(parseInt(Bun.env.WEB_PORT ?? '3000'))
  } catch (e) {
    db.close()
    log.app.error({ e }, 'failed to start app')
    process.exit(1)
  }
}

if (import.meta.main) {
  startup()
}

export { startup }
