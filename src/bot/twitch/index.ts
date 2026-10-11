import { createTwitch, type Twitch } from '@core/twitch'
import { init } from './init'
import { log } from '@core/logger'
import { relayChat } from '@core/chatRelay'

const startBot = async (twitch: Twitch) => {
  try {
    await init(twitch)
    twitch.listener.start()
  } catch (err) {
    log.app.error({ err }, 'chat bot failed to start')
  }
}

if (import.meta.main) {
  const twitch = await createTwitch() // need to scaffold everything first
  startBot(twitch)
  relayChat(twitch.listener, twitch.ownerId)
}

export { startBot }
