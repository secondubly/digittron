import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import fastifyPassport from '@fastify/passport'
import { getTokenParamsSchema } from '@server/schemas/spotify'
import { getToken } from '@server/controllers/spotify'

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.get(
        '/login',
        {
            preValidation: fastifyPassport.authenticate('spotify'),
        },
        async () => {},
    )

    fastify.get(
        '/callback',
        {
            preValidation: fastifyPassport.authenticate('spotify', {
                failureRedirect: '/spotify_login?error=spotify_failed',
            }),
        },
        async (_request, reply) => {
            reply.redirect('/')
        },
    )

    fastify.get(
        '/token/:id',
        {
            schema: {
                params: getTokenParamsSchema,
            },
        },
        getToken(fastify),
    )
}

export default plugin
