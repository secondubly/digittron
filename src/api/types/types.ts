import type { JWT } from '@fastify/jwt'
import type { preHandlerAsyncHookHandler } from 'fastify'

declare module 'fastify' {
    interface FastifyRequest {
        jwt: JWT
    }
    export interface FastifyInstance {
        authenticate: preHandlerAsyncHookHandler
    }
}

type UserPayload = {
    id: string
    username: string
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        user: UserPayload
    }
}
