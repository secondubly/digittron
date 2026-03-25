import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { FastifyJWT } from '@fastify/jwt'

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies.access_token

    if (!token) {
        return reply.status(401).send({ message: 'Authentication required' })
    }

    const decoded = request.jwt.verify<FastifyJWT['user']>(token)
    request.user = decoded
}

export default fp(
    async function authentication(app: FastifyInstance) {
        app.decorate('authenticate', authenticate)
    },
    { name: 'authenticate' },
)
