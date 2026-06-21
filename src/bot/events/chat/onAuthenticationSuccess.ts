import { log } from '@core/utils/logger'
import type { EventDeps, EventSubEvent } from '../types'
import { config } from '@core/config/env'

let isFirstConnection = true

export default ({ say }: EventDeps): EventSubEvent => ({
  type: 'eventsub',
  name: 'onAuthenticationSuccess',
  register({ chatClient }) {
    chatClient.onAuthenticationSuccess(() => {
      log.bot.info(`Ready to yap! 😃`)
      const startupMessages = [
        'I’m here, so we‘re good.',
        'Sorry, fell asleep there for a second.',
        'Safe journeys. Straight aim. And good huntin‘.',
        'Psst, hey. Take me with you. I hate this job.',
      ]

      if (isFirstConnection) {
        const message =
          startupMessages[Math.floor(Math.random() * startupMessages.length)]
        config.TWITCH_CHANNELS.forEach((chan) => say(chan, message))
        isFirstConnection = false
      }
      log.bot.info(
        `${isFirstConnection ? 'Connected' : 'Reconnected'} to Twitch, requesting ${config.TWITCH_CHANNELS.length} channels: ${config.TWITCH_CHANNELS.join(', ')}`,
      )
    })
  },
})
