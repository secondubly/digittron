// these methods are only used for twitch tokens

import { RefreshingAuthProvider, type AccessToken } from '@twurple/auth'
import { TokenStore } from './TokenStore'
import type { TokenRecord, TokenKey } from './types'
import { config } from 'src/config'

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
        scope: record.scope?.split(' '),
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

    if (broadcasterToken) {
        await provider.addUserForToken(toAccessToken(broadcasterToken), [
            'chat',
        ])
    }

    if (botToken) {
        await provider.addUserForToken(toAccessToken(botToken), ['chat'])
    }

    provider.onRefresh(async (userId, token) => {
        const key: TokenKey = `twitch:${userId}`

        await store.set(key, toTokenRecord(userId, token))
        console.log(`Token refreshed and saved for ${key}`)
    })

    return provider
}
