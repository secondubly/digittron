import { log } from '@core/utils/logger'
import type { ChatEvent } from '../types'
import { config } from '@core/config/env'

const joinedChannels = new Set<string>()
const expectedChannels = new Set<string>(
  config.TWITCH_CHANNELS.map((c) => c.toLocaleLowerCase()),
)
export default {
  type: 'chat',
  name: 'onJoin',
  register({ chatClient }) {
    chatClient.onJoin((channel, _user) => {
      const lowercaseChannel = channel.toLocaleLowerCase()
      if (
        expectedChannels.has(lowercaseChannel) &&
        !joinedChannels.has(lowercaseChannel)
      ) {
        joinedChannels.add(lowercaseChannel)
        log.bot.info(`Joined #${lowercaseChannel}`)
      }
    })
  },
} satisfies ChatEvent
