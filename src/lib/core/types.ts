export interface SpotifyAccessToken {
    access_token: string
    token_type: 'Bearer' // Token type will always be bearer
    expires_in: number
    refresh_token?: string
    scope: string // The scopes granted by the user
}
