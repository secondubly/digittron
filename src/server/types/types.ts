import type { JWT } from '@fastify/jwt'
import type { MikroORM } from '@mikro-orm/core'
import type { FastifyReply, preHandlerAsyncHookHandler } from 'fastify'

declare module 'fastify' {
    interface FastifyRequest {
        jwt: JWT
    }
    export interface FastifyInstance {
        authenticate: preHandlerAsyncHookHandler
        orm: MikroORM
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

export interface Client {
    id: number
    response: FastifyReply
}
