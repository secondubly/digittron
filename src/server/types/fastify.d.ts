import 'fastify'
import { MikroORM } from '@mikro-orm/core'
import { SqliteDriver, EntityManager } from '@mikro-orm/sqlite'
import { TokenStore } from '@core/TokenStore'
import type { RedisClientType } from 'redis'
import type { AuthWaiter } from '@core/AuthWait'
import type { Bot } from 'src/bot/bot'
import type { CommandRegistry } from '@lib/bot/CommandRegistry'
import type { User } from '@core/db/models/user.entity'

interface AuthUser {
  twitch_id: string
  username: string
  avatar: string
}

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
    user: AuthUser
  }

  interface PassportUser {
    id: string
    username: string
    avatar: string
  }

  type PassportUser = Pick<User, 'twitch_id' | 'username' | 'avatar'>
}

declare module '@fastify/session' {
  // placeholder
  interface SessionData {
    passport: {
      user: string // user's id
    }
  }
}
