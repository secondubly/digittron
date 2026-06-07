export interface TokenRecord {
    accessToken: string
    refreshToken: string | null
    expiresIn: number | null // seconds until expiry
    obtainedAt: number // unix ms timestamp
    scope: string[]
}

export type TokenKey = `token:${string}` | `deadlock:${string}`
