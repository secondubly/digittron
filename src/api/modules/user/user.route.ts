import { log } from '@lib/utils/logger'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { $ref } from './user.schema'
import { createUser, login, logout } from './user.controller'

export async function userRoutes(app: FastifyInstance) {
    app.get('/', (_req: FastifyRequest, reply: FastifyReply) => {
        reply.send({ message: '/ route hit' })
    })

    // POST /register - create new accounts
    app.post(
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
    app.post(
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
    app.delete('/logout', { preHandler: [app.authenticate] }, logout)
    log.api.info('user routes registered')
}
