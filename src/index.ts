import { db } from './bot/twitch/services/db'
import { log } from '@core/logger'
import { buildServer } from './web'
import { setupShutdownHandlers } from '@core/shutdown'
import { createTwitch } from '@core/twitch'
import { relayChat } from '@core/chatRelay'
import { startBot } from './bot/twitch'

const startup = async () => {
  setupShutdownHandlers()
  try {
    buildServer(Number(Bun.env.WEB_PORT ?? 3000))
    const twitch = await createTwitch()

    relayChat(twitch.listener, twitch.ownerId)

    try {
      await startBot(twitch)
    } catch (err) {
      log.app.error({ err }, 'chat bot failed to start')
    }
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
