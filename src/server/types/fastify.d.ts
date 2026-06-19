import 'fastify'
import { MikroORM } from '@mikro-orm/core'
import { SqliteDriver, EntityManager } from '@mikro-orm/sqlite'
import { TokenStore } from '@core/TokenStore'
import type { RedisClientType } from 'redis'
import type { TwitchProfile } from 'passport-twitch-new'
import type { AuthWaiter } from '@core/AuthWait'
import type { Bot } from 'src/bot/bot'
import type { CommandRegistry } from '@lib/bot/CommandRegistry'

declare module 'fastify' {
    interface FastifyInstance {
        orm: MikroORM<SqliteDriver>
        db: EntityManager // shorthand to access the entity manager
        tokenStore: TokenStore
        redis: RedisClientType
        authWaiter: AuthWaiter
        bot: Bot
        registry: CommandRegistry
        withBot?: bolean
        isAuthenticated(): boolean
        logIn(): Promise<void>
        logOut(): Promise<void>
    }

    interface FastifyRequest {
        em: EntityManager
        session?: {
            user?: {
                username?: string | null
                image?: string | null
            }
            expires: string
        }
        user?: TwitchProfile
    }

    interface PassportUser {
        id: string
    }
}

declare module '@fastify/session' {
    // placeholder
    interface FastifySessionObject {
        userId?: string
        userName?: string
        profileImg?: string
    }
}
