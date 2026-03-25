import type { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import { $ref } from '../../../schemas/user.js'
import { createUser, login } from '../../../controllers/user.js'

const plugin: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', (_req: FastifyRequest, reply: FastifyReply) => {
        reply.send({ message: '/ route hit' })
    })

    // POST /register - create new accounts
    fastify.post(
        '/register',
        {
            schema: {
                body: $ref('createUserSchema'),
                response: {
                    201: $ref('createUserResponseSchema'),
                },
            },
        },
        createUser,
    )

    // POST /login - log in to dashboard
    fastify.post(
        '/login',
        {
            schema: {
                body: $ref('loginSchema'),
                response: {
                    201: $ref('loginResponseSchema'),
                },
            },
        },
        login,
    )
    // DELETE /logout - log out (only for authenticated users)
    // fastify.delete('/logout', { preHandler: [fastify.authenticate] }, logout)
    fastify.log.info('user routes registered')
}

export default plugin
