import { createEvent } from 'arcscord'

export const clientReady = createEvent({
  event: 'clientReady',
  options: { once: true },
  run: (ctx) => {
    ctx.logger.info('ready!')
  },
})
