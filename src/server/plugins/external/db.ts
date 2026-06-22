import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { MikroORM } from '@mikro-orm/core'
import type { EntityManager } from '@mikro-orm/sqlite'
import mikroOrmConfig from '../../../mikro-orm.config'
import { log } from '@core/utils/logger'

export default fp(
  async (server: FastifyInstance) => {
    const orm = await MikroORM.init(mikroOrmConfig)

    log.app.info('Checking for database migrations...')
    await orm.migrator.up()

    server.decorate('orm', orm)
    server.decorate('db', orm.em)

    server.addHook('onRequest', async (req) => {
      req.em = orm.em.fork() as EntityManager
    })

    server.addHook('onClose', async () => {
      await orm.close()
    })
  },
  { name: 'db' },
)
