// plugins/authWaiter.ts
import { AuthWaiter } from '@core/tokens/AuthWait'
import fp from 'fastify-plugin'

export default fp(
  async (app) => {
    app.decorate('authWaiter', new AuthWaiter())
  },
  { name: 'authWaiter' },
)
