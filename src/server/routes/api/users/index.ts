import type { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import { createUser, login, logout } from '../../../controllers/user.js'
import {
    createUserResponseSchema,
    createUserSchema,
    loginResponseSchema,
    loginSchema,
} from 'src/server/schemas/user.js'

const plugin: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', (_req: FastifyRequest, reply: FastifyReply) => {
        reply.send({ message: '/ route hit' })
    })

    // POST /register - create new accounts
    fastify.post(
        '/register',
        {
            schema: {
                body: createUserSchema,
                response: {
                    201: createUserResponseSchema,
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
                body: loginSchema,
                response: {
                    201: loginResponseSchema,
                },
            },
        },
        login,
    )
    // DELETE /logout - log out (only for authenticated users)
    fastify.delete('/logout', { preHandler: [fastify.authenticate] }, logout)
}

export default plugin
