import { type RedisClientType } from 'redis'
import type {
    TokenRecord,
    TokenKey,
    TokenProvider,
    ThirdPartyTokenRecord,
    OauthTokenRecord,
} from './types'
import type { SqlEntityManager } from '@mikro-orm/sqlite'
import { log } from '@lib/services/logger'
import { User } from '@lib/db/models/user.entity'
import { OauthToken } from '@lib/db/models/OauthToken'
import crypto from 'crypto'
import { config } from 'src/config/env'

const TTL_BUFFER_S = 60
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

type ProviderEntity =
    | Pick<
          User,
          | 'access_token_encrypted'
          | 'refresh_token_encrypted'
          | 'expires_in'
          | 'twitch_id'
      >
    | Omit<OauthToken, 'updatedAt' | 'token_type' | 'updated_at'>

export class TokenStore {
    constructor(
        private readonly redis: RedisClientType,
        private readonly em: SqlEntityManager,
    ) {}

    async connect(): Promise<void> {
        await this.redis.connect()
        console.log('TokenStore connected to Redis')
    }

    async disconnect(): Promise<void> {
        await this.redis.destroy()
    }

    async set(key: TokenKey, token: TokenRecord): Promise<void> {
        Promise.all([this.setDb(key, token), this.setCache(key, token)])
    }

    async setBot(token: TokenRecord): Promise<void> {
        const key: TokenKey = `twitch:${config.TWITCH_BOT_ID}`
        Promise.all([this.setBotDB(key, token), this.setCache(key, token)])
    }

    async get(key: TokenKey): Promise<TokenRecord | null> {
        try {
            const cached = await this.redis.get(key)
            if (cached) return JSON.parse(cached) as TokenRecord
        } catch (err) {
            log.app.error({ err }, 'Redis get token error')
        }

        const { userId } = this.parseKey(key)
        let record: TokenRecord | null
        if (userId === config.TWITCH_BOT_ID) {
            // twitch bot key retrieval operates a little differet
            record = await this.getTwitchBot(key)
        } else {
            record = await this.getDb(key)
        }

        if (!record) return null

        await this.setCache(key, record)
        return record
    }

    async delete(key: TokenKey) {
        await Promise.all([this.deleteDb(key), this.redis.del(key)])
    }

    async getTwitchBot(key: TokenKey): Promise<TokenRecord | null> {
        const { userId } = this.parseKey(key)
        const row = await this.em.findOne(OauthToken, { id: Number(userId) })

        if (!row) return null

        if (!row.refresh_token_encrypted)
            throw Error('Bot token is missing refresh token - re-auth required')

        const botTokenRecord = {
            accessToken: this.decryptToken(row.access_token_encrypted),
            refreshToken: this.decryptToken(row.refresh_token_encrypted),
            expiresIn: row.expires_in ?? 0,
            obtainedAt: new Date(row.created_at).getTime(),
            scope: TWITCH_BOT_SCOPE_STRING,
            provider: 'twitch',
            userId: userId,
        } as ThirdPartyTokenRecord

        return botTokenRecord
    }

    private async setBotDB(key: TokenKey, token: TokenRecord): Promise<void> {
        const typedToken = token as OauthTokenRecord
        const { userId } = this.parseKey(key)
        let row: OauthToken | null = null
        row = await this.em.findOne(OauthToken, { id: Number(userId) })

        if (!row) {
            this.em.create(OauthToken, {
                id: Number(userId),
                access_token_encrypted: this.encryptToken(
                    typedToken.accessToken,
                ),
                refresh_token_encrypted: this.encryptToken(
                    typedToken.refreshToken,
                ),
                provider_name: 'twitch',
                token_type: null,
                expires_in: typedToken.expiresIn,
            })
        } else {
            row.access_token_encrypted = this.encryptToken(
                typedToken.accessToken,
            )
            row.refresh_token_encrypted = this.encryptToken(
                typedToken.refreshToken,
            )
            row.created_at = new Date(typedToken.obtainedAt)
            row.expires_in = typedToken.expiresIn
        }

        await this.em.flush()
        return
    }

    private encryptToken(token: string) {
        const iv = crypto.randomBytes(IV_LENGTH)
        const cipher = crypto.createCipheriv(
            ALGORITHM,
            Buffer.from(config.ENCRYPTION_KEY, 'hex'),
            iv,
        )
        let encrypted = cipher.update(token, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        const authTag = cipher.getAuthTag()

        // Return iv, authTag, and encrypted data concatenated (so it can be decrypted later)
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
    }

    private decryptToken(text: string) {
        const [ivHex, tagHex, encryptedText] = text.split(':')
        const iv = Buffer.from(ivHex, 'hex')
        const authTag = Buffer.from(tagHex, 'hex')
        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            Buffer.from(config.ENCRYPTION_KEY, 'hex'),
            iv,
        )
        decipher.setAuthTag(authTag)
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
        decrypted += decipher.final('utf8')

        return decrypted
    }

    private parseKey(key: TokenKey): {
        provider: TokenProvider
        userId: string
    } {
        const [provider, userId] = key.split(':') as [TokenProvider, string]
        return { provider, userId }
    }

    private getEntity(provider: TokenProvider) {
        return provider === 'twitch' ? User : OauthToken
    }

    private getUserIdField(provider: TokenProvider): string {
        return provider === 'twitch' ? 'twitch_id' : 'user_id'
    }

    private async getDb(key: TokenKey): Promise<TokenRecord | null> {
        const { provider, userId } = this.parseKey(key)
        const Entity = this.getEntity(provider)

        let row: OauthToken | User | null = null
        if (Entity === OauthToken) {
            row = await this.em.findOne(OauthToken, { user_id: userId })
        } else {
            row = await this.em.findOne(User, { twitch_id: userId })
        }

        if (!row) return null

        return this.toRecord(row, provider, userId)
    }

    private async setDb(key: TokenKey, token: TokenRecord): Promise<void> {
        const { provider, userId } = this.parseKey(key)
        const Entity = this.getEntity(provider)
        const userIdField = this.getUserIdField(provider)

        const existing = await this.em.findOne(Entity as any, {
            [userIdField]: userId,
        })

        if (existing instanceof OauthToken) {
            existing.access_token_encrypted = this.encryptToken(
                token.accessToken,
            )
            existing.refresh_token_encrypted = token.refreshToken
                ? this.encryptToken(token.refreshToken)
                : null
            existing.expires_in = token.expiresIn
            existing.created_at = new Date(token.obtainedAt)
        } else if (existing instanceof User) {
            const parsedUser = existing as User
            parsedUser.access_token_encrypted = this.encryptToken(
                token.accessToken,
            )
            parsedUser.refresh_token_encrypted = this.encryptToken(
                (token as OauthTokenRecord).refreshToken,
            )
            parsedUser.expires_in = token.expiresIn
        } else {
            await this.createRecord(provider, token)
        }

        await this.em.flush()
    }

    private async deleteDb(key: TokenKey): Promise<void> {
        const { provider, userId } = this.parseKey(key)
        const Entity = this.getEntity(provider)
        const userIdField = this.getUserIdField(provider)

        // REVIEW: check if this works
        const row = await this.em.findOne(Entity as any, {
            [userIdField]: userId,
        })

        if (row) await this.em.remove(row).flush()
    }

    private async setCache(key: TokenKey, token: TokenRecord): Promise<void> {
        const ttl = this.getTtl(token)

        // REVIEW: we should cache the refresh token, right?
        await this.redis.set(key, JSON.stringify(token), ttl ? { EX: ttl } : {})
    }

    private createRecord(provider: TokenProvider, tokenRecord: TokenRecord) {
        if ('avatar' in tokenRecord) {
            // this is a user record
            this.em.create(User, {
                twitch_id: tokenRecord.twitchId,
                username: tokenRecord.username,
                avatar: tokenRecord.avatar,
                access_token_encrypted: this.encryptToken(
                    tokenRecord.accessToken,
                ),
                refresh_token_encrypted: this.encryptToken(
                    tokenRecord.refreshToken,
                ),
                expires_in: tokenRecord.expiresIn,
                scopes: tokenRecord.scope,
            })
        } else {
            this.em.create(OauthToken, {
                id: Number(tokenRecord.userId),
                user_id: config.TWITCH_BROADCASTER_ID,
                access_token_encrypted: this.encryptToken(
                    tokenRecord.accessToken,
                ),
                refresh_token_encrypted: tokenRecord.refreshToken
                    ? this.encryptToken(tokenRecord.refreshToken)
                    : null,
                expires_in: tokenRecord.expiresIn,
                provider_name: provider,
            })
        }
    }

    private toRecord(
        row: ProviderEntity,
        provider: TokenProvider,
        userId: string,
    ): TokenRecord {
        // twitch bot and spotify tokens are considered oauth tokens
        if (provider === 'spotify') {
            const castRow = row as OauthToken
            return {
                accessToken: this.decryptToken(castRow.access_token_encrypted),
                refreshToken: castRow.refresh_token_encrypted
                    ? this.decryptToken(castRow.refresh_token_encrypted)
                    : null,
                expiresIn: castRow.expires_in ?? 0,
                obtainedAt: new Date(castRow.created_at).getTime(),
                scope: '',
                provider,
                userId: userId,
                profile_image_url: null,
            } as ThirdPartyTokenRecord
        } else {
            const castRow = row as User
            return {
                accessToken: this.decryptToken(castRow.access_token_encrypted),
                refreshToken: this.decryptToken(
                    castRow.refresh_token_encrypted,
                ),
                expiresIn: castRow.expires_in,
                obtainedAt: new Date(castRow.created_at).getTime(),
                scope: castRow.scopes,
                provider,
                twitchId: userId,
                username: castRow.username,
                avatar: castRow.avatar ?? '',
            } as OauthTokenRecord
        }
    }

    private getTtl(token: TokenRecord): number | null {
        if (!token.expiresIn) return null
        // obtainedAt is in milliseconds, expiresIn is in seconds, so we need parentheses
        const expiresAt = token.obtainedAt + token.expiresIn * 1000
        const remaining = Math.floor((expiresAt - Date.now()) / 1000)
        return Math.max(remaining - TTL_BUFFER_S, 1)
    }
}
