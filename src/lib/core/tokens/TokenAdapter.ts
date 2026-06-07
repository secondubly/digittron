// tokens/TwitchTokenAdapter.ts
import { RefreshingAuthProvider, type AccessToken } from '@twurple/auth'
import { TokenStore } from './TokenStore'
import type { TokenRecord, TokenKey } from './types'

function toTokenRecord(token: AccessToken): TokenRecord {
    return {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken ?? null,
        expiresIn: token.expiresIn ?? null,
        obtainedAt: token.obtainmentTimestamp,
        scope: token.scope,
    }
}

function toAccessToken(record: TokenRecord): AccessToken {
    return {
        accessToken: record.accessToken,
        refreshToken: record.refreshToken,
        expiresIn: record.expiresIn,
        obtainmentTimestamp: record.obtainedAt,
        scope: record.scope,
    }
}

export async function createAuthProvider(
    clientId: string,
    clientSecret: string,
    store: TokenStore,
): Promise<RefreshingAuthProvider> {
    const provider = new RefreshingAuthProvider({ clientId, clientSecret })

    const [broadcasterToken, botToken] = await Promise.all([
        store.get('token:broadcaster'),
        store.get('token:bot'),
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
        const key: TokenKey =
            userId === botToken?.accessToken ? 'token:bot' : 'token:broadcaster'

        await store.set(key, toTokenRecord(token))
        console.log(`Token refreshed and saved for ${key}`)
    })

    return provider
}
