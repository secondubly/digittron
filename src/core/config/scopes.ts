export const TWITCH_BROADCASTER_SCOPES = [
    'bits:read',
    'channel:bot',
    'channel:manage:broadcast',
    'channel:manage:polls',
    'channel:manage:predictions',
    'channel:manage:raids',
    'channel:manage:redemptions',
    'channel:manage:schedule',
    'channel:manage:videos',
    'channel:read:editors',
    'channel:read:hype_train',
    'channel:read:polls',
    'channel:read:predictions',
    'channel:read:redemptions',
    'channel:read:subscriptions',
    'channel:read:vips',
    'clips:edit',
    'moderation:read',
    'user:read:subscriptions',
] as const

export const TWITCH_BOT_SCOPES = [
    'moderator:manage:announcements',
    'moderator:manage:banned_users',
    'moderator:manage:chat_messages',
    'moderator:manage:shoutouts',
    'moderator:manage:warnings',
    'moderator:read:chat_settings',
    'moderator:read:chatters',
    'moderator:read:followers',
    'moderator:read:moderators',
    'moderator:read:vips',
    'user:bot',
    'user:read:chat',
    'user:write:chat',
] as const

export const SPOTIFY_SCOPES = [
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-read-email',
    'user-read-playback-state',
    'user-read-private',
    'user-read-recently-played',
    'user-top-read',
    'streaming',
] as const

export type TwitchBroadcasterScope = (typeof TWITCH_BROADCASTER_SCOPES)[number]
export type TwitchBotScope = (typeof TWITCH_BOT_SCOPES)[number]
export type TwitchScope = TwitchBroadcasterScope | TwitchBotScope
export type SpotifyScope = (typeof SPOTIFY_SCOPES)[number]

// Used for Oauth URLs

export const TWITCH_BROADCASTER_SCOPE_STRING =
    TWITCH_BROADCASTER_SCOPES.join(' ')
export const TWITCH_BOT_SCOPE_STRING = TWITCH_BOT_SCOPES.join(' ')
export const SPOTIFY_SCOPE_STRING = SPOTIFY_SCOPES.join(' ')

// ease of use export

export const SCOPES = {
    twitch: {
        broadcaster: TWITCH_BROADCASTER_SCOPES,
        bot: TWITCH_BOT_SCOPES,
    },
    spotify: SPOTIFY_SCOPES,
} as const
