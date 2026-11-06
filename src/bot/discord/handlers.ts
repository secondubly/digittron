import type { HandlersList } from 'arcscord'
import { commands } from './commands'
import { messageHoneypotEvent } from './events/honeypot'
import { clientReady } from './events/client_ready'

const events = []

if (Bun.env.HONEYPOT_CHANNEL_ID) {
  events.push(messageHoneypotEvent)
}

events.push(clientReady)

export default {
  events: events,
  commands,
} satisfies HandlersList
