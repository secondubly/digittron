import { TokenStore } from './TokenStore'
import { log } from '../../../lib/services/logger.js'
import type { OauthTokenRecord, TokenKey } from './types'
import { config } from 'src/config/env'

const VALIDATE_URL = 'https://id.twitch.tv/oauth2/validate'
const VALIDATE_INTERVAL_MS = 60 * 60 * 1000 // 1 hour
const REFRESH_BUFFER_MS = 5 * 60 * 1000 // refresh 5min before expiry
const MIN_REFRESH_DELAY_MS = 5_000 // never schedule sooner than 5s out

interface ValidationResult {
    valid: boolean
    expiresIn?: number
    login?: string
    userId?: string
    scopes?: string[]
}

export class TokenValidator {
    private validateInterval: ReturnType<typeof setInterval> | null = null

    // one refresh timer per token key
    private refreshTimers = new Map<TokenKey, ReturnType<typeof setTimeout>>()

    constructor(private readonly tokenStore: TokenStore) {}

    async validate(tokenKey: TokenKey): Promise<ValidationResult> {
        const record = await this.tokenStore.get(tokenKey)
        if (!record) return { valid: false }

        try {
            const res = await fetch(VALIDATE_URL, {
                headers: { Authorization: `OAuth ${record.accessToken}` },
            })

            if (res.status === 401) {
                log.bot.warn(
                    `Token ${tokenKey} is invalid — attempting refresh`,
                )

                await this.refresh(tokenKey)
                return { valid: false }
            }

            if (!res.ok) {
                log.bot.error(`Validation request failed: ${res.status}`)
                return { valid: false }
            }

            const data = await res.json()
            const result: ValidationResult = {
                valid: true,
                expiresIn: data.expires_in,
                login: data.login,
                userId: data.user_id,
                scopes: data.scopes,
            }

            if (result.expiresIn) {
                this.scheduleRefresh(tokenKey, result.expiresIn)
            }

            return result
        } catch (err) {
            log.bot.error({ err }, 'Token validation error')
            return { valid: false }
        }
    }

    async validateAll(tokenKeys: TokenKey[]): Promise<void> {
        await Promise.all(
            tokenKeys.map(async (key) => {
                const result = await this.validate(key)

                if (!result.valid) {
                    log.bot.warn(
                        `Token ${key} failed validation — triggering refresh`,
                    )
                    await this.refresh(key)
                    return
                }

                log.bot.info(
                    `Token ${key} valid | expires in ${result.expiresIn}s | user: ${result.login}`,
                )

                // warn if expiring soon — under 1hr means schedule a refresh
                if (result.expiresIn && result.expiresIn < 3600) {
                    log.bot.warn(
                        `⏰  Token ${key} expiring soon (${result.expiresIn}s)`,
                    )
                }
            }),
        )
    }

    private scheduleRefresh(
        tokenKey: TokenKey,
        expiresInSeconds: number,
    ): void {
        // clear any existing timer for this token
        const existing = this.refreshTimers.get(tokenKey)
        if (existing) clearTimeout(existing)

        const expiresInMs = expiresInSeconds * 1000
        const delayMs = Math.max(
            expiresInMs - REFRESH_BUFFER_MS,
            MIN_REFRESH_DELAY_MS,
        )

        log.bot.info(
            `⏰  Scheduling refresh for ${tokenKey} in ${Math.round(delayMs / 1000)}s`,
        )

        const timer = setTimeout(async () => {
            log.bot.info(`🔄  Scheduled refresh firing for ${tokenKey}`)
            await this.refresh(tokenKey)
            this.refreshTimers.delete(tokenKey)
        }, delayMs)

        this.refreshTimers.set(tokenKey, timer)
    }

    private async refresh(tokenKey: TokenKey): Promise<void> {
        const record = (await this.tokenStore.get(tokenKey)) as OauthTokenRecord
        if (!record?.refreshToken) {
            log.bot.error(`No refresh token for ${tokenKey} — re-auth required`)
            return
        }

        try {
            const res = await fetch('https://id.twitch.tv/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: record.refreshToken,
                    client_id: config.TWITCH_CLIENT_ID,
                    client_secret: config.TWITCH_CLIENT_SECRET,
                }),
            })

            if (!res.ok) {
                log.bot.error(`Refresh failed for ${tokenKey}: ${res.status}`)
                return
            }

            const data = await res.json()

            const userId = tokenKey.split(':')[1]

            await this.tokenStore.set(tokenKey, {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
                obtainedAt: Date.now(),
                scope: data.scope,
                userId: userId,
                provider: 'twitch',
                username: record.username,
                avatar: record.avatar,
            })

            log.bot.info(`Token ${tokenKey} refreshed successfully`)
        } catch (err) {
            log.bot.error({ err }, `Refresh error for ${tokenKey}`)
        }
    }

    start(tokenKeys: TokenKey[]): void {
        if (this.validateInterval) return

        this.validateAll(tokenKeys) // immediate check — also schedules refreshes

        this.validateInterval = setInterval(
            () => this.validateAll(tokenKeys),
            VALIDATE_INTERVAL_MS,
        )

        log.bot.info('Token validation loop started (every 60min)')
    }

    stop(): void {
        if (this.validateInterval) {
            clearInterval(this.validateInterval)
            this.validateInterval = null
        }

        // clear all pending refresh timers
        for (const timer of this.refreshTimers.values()) {
            clearTimeout(timer)
        }
        this.refreshTimers.clear()
    }
}
