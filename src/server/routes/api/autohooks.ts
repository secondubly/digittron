import { MikroORM, RequestContext } from '@mikro-orm/core'
import { type FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
    const orm = fastify.orm as MikroORM

    if (!orm) {
        throw new Error(
            'MikroORM instance not found on Fastify instance. Ensure the ORM plugin is registered first.',
        )
    }
    fastify.addHook('onRequest', (_request, _reply, done) => {
        RequestContext.create(fastify.orm.em, done)
    })
}
