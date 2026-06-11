import type { FastifyPluginAsync } from 'fastify'
import { getToken, handleCallback } from '../../../controllers/spotify.js'
import { callbackQuerySchema } from 'src/server/schemas/spotify.js'
import fastifyPassport from '@fastify/passport'

const plugin: FastifyPluginAsync = async (fastify) => {
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
}

export default plugin
