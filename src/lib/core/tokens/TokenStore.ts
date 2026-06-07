import { type RedisClientType } from 'redis'
import type { TokenRecord, TokenKey } from './types'
import type { MikroORM } from '@mikro-orm/sqlite'

export class TokenStore {
    private readonly client: RedisClientType
    private readonly db: MikroORM | undefined
    private readonly ttlBuffer = 60 // refresh 60s before actual expiry

    constructor(redis: RedisClientType, db?: MikroORM) {
        this.client = redis
        this.db = db ?? undefined
    }

    async connect(): Promise<void> {
        await this.client.connect()
        console.log('TokenStore connected to Redis')
    }

    async disconnect(): Promise<void> {
        await this.client.destroy()
    }

    // TODO: update DB when setting a token
    async set(key: TokenKey, token: TokenRecord): Promise<void> {
        const ttl = this.getTtl(token)

        await this.client.set(key, JSON.stringify(token), {
            ...(ttl ? { EX: ttl } : {}), // auto-expire in Redis when token expires
        })
    }

    // TODO: if token not available check the database directly
    async get(key: TokenKey): Promise<TokenRecord | null> {
        const raw = await this.client.get(key)
        if (!raw) return null
        return JSON.parse(raw) as TokenRecord
    }

    async isExpired(key: TokenKey): Promise<boolean> {
        const token = await this.get(key)
        if (!token) return true
        return this.tokenExpired(token)
    }

    async delete(key: TokenKey): Promise<void> {
        await this.client.del(key)
    }

    private tokenExpired(token: TokenRecord): boolean {
        if (!token.expiresIn) return false // no expiry set
        const expiresAt = token.obtainedAt + token.expiresIn * 1000
        return Date.now() >= expiresAt - this.ttlBuffer * 1000
    }

    private getTtl(token: TokenRecord): number | null {
        if (!token.expiresIn) return null
        const expiresAt = token.obtainedAt + token.expiresIn * 1000
        const remaining = Math.floor((expiresAt - Date.now()) / 1000)
        return Math.max(remaining - this.ttlBuffer, 1)
    }
}
