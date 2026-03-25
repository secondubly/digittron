import fp from 'fastify-plugin'
import { MikroORM } from '@mikro-orm/sqlite'
import type { FastifyInstance } from 'fastify'

// decorate fastify instance with ORM
const orm = await MikroORM.init()

async function mikroHookPlugin(fastify: FastifyInstance) {
    fastify.orm = orm
}

export default fp(mikroHookPlugin)
