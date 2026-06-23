import { type RedisClientType } from 'redis'
import type {
  TokenRecord,
  TokenKey,
  TokenProvider,
  ThirdPartyTokenRecord,
  OauthTokenRecord,
} from './types'
import type { EntityClass, SqlEntityManager } from '@mikro-orm/sqlite'
import { log } from '../utils/logger'
import { User } from '../db/models/user.entity'
import { OauthToken } from '../db/models/OauthToken.entity'
import crypto from 'crypto'
import { config } from '../config/env'
import type { MMRHistory } from '@commands/rank'

const TTL_BUFFER_S = 60
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

type ProviderEntity =
  | Pick<User, 'access_token_encrypted' | 'refresh_token_encrypted' | 'expires_in' | 'twitch_id'>
  | Omit<OauthToken, 'updatedAt' | 'token_type' | 'updated_at'>

export class TokenStore {
  constructor(
    private readonly redis: RedisClientType,
    private readonly em: SqlEntityManager,
  ) {
    if (em.global) {
      // if we were passed a global entity manager, we need to fork it
      this.em = em.fork()
    }
  }

  async connect(): Promise<void> {
    await this.redis.connect()
    log.app.info('TokenStore connected to Redis')
  }

  async disconnect(): Promise<void> {
    await this.redis.destroy()
  }

  async set(key: TokenKey, data: TokenRecord | MMRHistory): Promise<void> {
    if (this.isTokenRecord(data)) {
      // we need to await this in order to be sure the data is written successfully
      await Promise.all([this.setDb(key, data), this.setCache(key, data)])
    } else {
      // only used for deadlock tokens
      this.setCache(key, data)
    }
  }

  public async get(key: TokenKey): Promise<TokenRecord | MMRHistory | null> {
    if (key.includes('deadlock')) {
      const cached = await this.redis.get(key)
      if (cached) return JSON.parse(cached) as MMRHistory
      return null
    } else {
      try {
        const cached = await this.redis.get(key)
        if (cached) return JSON.parse(cached) as TokenRecord
      } catch (err) {
        log.app.error({ err }, 'Redis get token error')
      }

      const record = await this.getDb(key)
      if (!record) return null

      await this.setCache(key, record)
      return record
    }
  }

  async delete(key: TokenKey) {
    await Promise.all([this.deleteDb(key), this.redis.del(key)])
  }

  private encryptToken(token: string) {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(config.ENCRYPTION_KEY, 'hex'), iv)
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

  private getEntity(provider: TokenProvider): EntityClass<OauthToken | User> {
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

    const existing = await this.em.findOne(Entity, {
      [userIdField]: userId,
    })

    if (existing instanceof OauthToken && existing.provider_name === provider) {
      existing.access_token_encrypted = this.encryptToken(token.accessToken)
      existing.refresh_token_encrypted = token.refreshToken
        ? this.encryptToken(token.refreshToken)
        : null
      existing.expires_in = token.expiresIn
      existing.created_at = new Date(token.obtainedAt)
    } else if (existing instanceof User) {
      const parsedUser = existing as User
      parsedUser.access_token_encrypted = this.encryptToken(token.accessToken)
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

    const row = await this.em.findOne(Entity, {
      [userIdField]: userId,
    })

    if (row) await this.em.remove(row).flush()
  }

  private isTokenRecord(data: TokenRecord | MMRHistory): data is TokenRecord {
    return 'accessToken' in data
  }

  private async setCache(key: TokenKey, token: TokenRecord): Promise<void>
  private async setCache(key: TokenKey, rank: MMRHistory): Promise<void>

  private async setCache(key: TokenKey, data: TokenRecord | MMRHistory): Promise<void> {
    if (this.isTokenRecord(data)) {
      const ttl = this.getTtl(data)

      await this.redis.set(key, JSON.stringify(data), ttl ? { EX: ttl } : {})
    } else {
      await this.redis.set(key, JSON.stringify(data), { EX: 60 * 60 * 3 })
    }
  }

  private createRecord(provider: TokenProvider, tokenRecord: TokenRecord) {
    if ('avatar' in tokenRecord) {
      this.em.create(User, {
        twitch_id: tokenRecord.twitchId,
        username: tokenRecord.username,
        avatar: tokenRecord.avatar,
        access_token_encrypted: this.encryptToken(tokenRecord.accessToken),
        refresh_token_encrypted: this.encryptToken(tokenRecord.refreshToken),
        expires_in: tokenRecord.expiresIn,
        scopes: tokenRecord.scope,
      })
    } else {
      this.em.create(OauthToken, {
        user_id: config.TWITCH_BROADCASTER_ID,
        access_token_encrypted: this.encryptToken(tokenRecord.accessToken),
        refresh_token_encrypted: tokenRecord.refreshToken
          ? this.encryptToken(tokenRecord.refreshToken)
          : null,
        expires_in: tokenRecord.expiresIn,
        provider_name: provider,
      })
    }
  }

  private toRecord(row: ProviderEntity, provider: TokenProvider, userId: string): TokenRecord {
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
        refreshToken: this.decryptToken(castRow.refresh_token_encrypted),
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
