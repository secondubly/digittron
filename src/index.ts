import { startBot } from './bot/twitch'
import { buildServer } from './web'

const startup = () => {
  try {
    startBot()
    buildServer(parseInt(Bun.env.WEB_PORT ?? '3000'))
  } catch (e) {
    console.log('error', e)
    process.exit(1)
  }
}

if (import.meta.main) {
  startup()
}

export { startup }
