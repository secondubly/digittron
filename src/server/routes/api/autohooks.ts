import { MikroORM, RequestContext } from '@mikro-orm/core'
import { type FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
    const orm = fastify.orm as MikroORM

    if (!orm) {
        throw new Error(
            'MikroORM instance not found on Fastify instance. Ensure the ORM plugin is registered first.',
        )
    }
    fastify.addHook('onRequest', (request, _reply, done) => {
        request.log.debug(`====== STARTING LIFECYCLE: ${request.url} ======`)
        RequestContext.create(fastify.orm.em, done)
    })

    // Log right before route validation starts
    fastify.addHook('preValidation', async (request, _reply) => {
        request.log.debug(`-> Fastify entering global preValidation hook`)
    })

    // Log right before your actual route handler function runs
    fastify.addHook('preHandler', async (request, _reply) => {
        request.log.debug(`-> Fastify entering global preHandler hook`)
    })

    fastify.addHook('onResponse', (request, reply, done) => {
        request.log.debug(
            `====== ENDING LIFECYCLE: ${request.url} (status: ${reply.statusCode}) ======`,
        )
        done()
    })
}
