// types/fastify.d.ts
import type { JWT } from '@fastify/jwt'
import { MikroORM } from '@mikro-orm/core'
import { SqliteDriver, EntityManager } from '@mikro-orm/sqlite'

declare module 'fastify' {
    interface FastifyInstance {
        orm: MikroORM<SqliteDriver>
        db: EntityManager // shorthand to access the entity manager
        tokenStore: TokenStore
    }

    interface FastifyRequest {
        em: EntityManager
        jwt: JWT
    }
}
