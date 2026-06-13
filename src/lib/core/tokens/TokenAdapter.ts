// these methods are only used for twitch tokens

import { RefreshingAuthProvider, type AccessToken } from '@twurple/auth'
import { TokenStore } from './TokenStore'
import type { TokenRecord, TokenKey } from './types'
import { config } from 'src/config/env'
import { log } from '@lib/services/logger'

function toTokenRecord(userId: string, token: AccessToken): TokenRecord {
    return {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken!,
        expiresIn: token.expiresIn ?? 0,
        obtainedAt: token.obtainmentTimestamp,
        scope: token.scope.join(' '),
        provider: 'twitch',
        userId,
    }
}

function toAccessToken(record: TokenRecord): AccessToken {
    return {
        accessToken: record.accessToken,
        refreshToken: record.refreshToken ?? null,
        expiresIn: record.expiresIn,
        obtainmentTimestamp: record.obtainedAt,
        scope: record.scope.split(' '),
    }
}

export async function createAuthProvider(
    clientId: string,
    clientSecret: string,
    store: TokenStore,
): Promise<RefreshingAuthProvider> {
    const provider = new RefreshingAuthProvider({ clientId, clientSecret })

    const [broadcasterToken, botToken] = await Promise.all([
        store.get(`twitch:${config.TWITCH_BROADCASTER_ID}`),
        store.get(`twitch:${config.TWITCH_BOT_ID}`),
    ])

    provider.onRefresh(async (userId, token) => {
        const key: TokenKey = `twitch:${userId}`

        if (userId === config.TWITCH_BOT_ID) {
            await store.setBot(toTokenRecord(userId, token))
        } else {
            await store.set(key, toTokenRecord(userId, token))
        }
        log.bot.info(`Token refreshed and saved for ${key}`)
    })

    // we honestly don't need these if checks, but keep them for testing purposes
    if (broadcasterToken) {
        // forcibly refresh token on bot startup
        broadcasterToken.expiresIn = 0
        await provider.addUserForToken(toAccessToken(broadcasterToken), [
            'chat',
        ])
    }

    if (botToken) {
        botToken.expiresIn = 0
        await provider.addUserForToken(toAccessToken(botToken), ['chat'])
    }

    return provider
}
