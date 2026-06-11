export type TokenProvider = 'twitch' | 'spotify'

// matches what you get from Spotify, along with extra Twitch fields
export interface ThirdPartyTokenRecord {
    accessToken: string
    refreshToken?: string
    expiresIn: number
    obtainedAt: number
    scope: string
    userId: string
    provider: TokenProvider
}

// used for logging into dashboard
export interface OauthTokenRecord {
    twitchId: string
    username: string
    avatar: string
    accessToken: string
    refreshToken: string
    expiresIn: number
    obtainedAt: number
    scope: string
    provider: 'twitch'
}
/**
 * Token Keys:
 * twitch:12345
 * spotify:12345
 */
export type TokenKey = `${'twitch' | 'spotify'}:${string}`

export type TokenRecord = OauthTokenRecord | ThirdPartyTokenRecord
