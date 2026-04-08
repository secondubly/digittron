import path from 'node:path'
import fastifyAutoload from '@fastify/autoload'
import type { FastifyError, FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function bootstrap(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    delete opts.skipOverride
    /**
     * load external plugins first because the server may need them immediately
     */
    await fastify.register(fastifyAutoload, {
        dir: path.join(import.meta.dirname, 'plugins/external'),
        options: { ...opts },
    })

    await fastify.register(fastifyAutoload, {
        dir: path.join(import.meta.dirname, 'plugins/server'),
        options: { ...opts },
    })

    fastify.register(fastifyAutoload, {
        dir: path.join(import.meta.dirname, 'routes'),
        autoHooks: true,
        cascadeHooks: true,
        options: { ...opts },
    })

    fastify.setErrorHandler((err: FastifyError, request, reply) => {
        fastify.log.error(
            {
                err,
                request: {
                    method: request.method,
                    url: request.url,
                    query: request.query,
                    params: request.params,
                },
            },
            'Unhandled error occurred',
        )

        reply.code(err.statusCode ?? 500)
        let message = 'Internal Server Error'
        if (err.statusCode && err.statusCode < 500) {
            message = err.message
        }

        return { message }
    })

    // An attacker could search for valid URLs if error handling is not rate limited.
    fastify.setNotFoundHandler(
        {
            preHandler: fastify.rateLimit({
                max: 3,
                timeWindow: 500,
            }),
        },
        (request, reply) => {
            request.log.warn(
                {
                    request: {
                        method: request.method,
                        url: request.url,
                        query: request.query,
                        params: request.params,
                    },
                },
                'Resource not found',
            )

            reply.code(404)

            return { message: 'Not Found' }
        },
    )
}
