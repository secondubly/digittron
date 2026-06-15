import { log } from '@lib/services/logger'
import { Type, type StaticDecode } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

const SpaceSeparatedChannels = Type.Transform(Type.String({ minLength: 1 }))
    .Decode((values) => {
        const channels = values.split(' ').map((c) => c.trim())

        return channels // string[]
    })
    .Encode((channels) => channels.join(','))

const EnvSchema = Type.Object({
    TWITCH_CLIENT_ID: Type.String({ minLength: 1 }),
    TWITCH_CLIENT_SECRET: Type.String({ minLength: 1 }),
    TWITCH_BROADCASTER_ID: Type.String({ minLength: 1 }),
    TWITCH_BOT_ID: Type.String({ minLength: 1 }),
    TWITCH_CHANNELS: SpaceSeparatedChannels,
    LEAD_TIME_MS: Type.Number({ default: 60_000 }),
    POLL_INTERVAL_MS: Type.Number({ default: 300_000 }),
    REDIS_URL: Type.String({ default: 'redis:6379' }),
    RATE_LIMIT_MAX: Type.Number({ default: 4 }),
    ENCRYPTION_KEY: Type.String({ minLength: 1 }),
    SESSION_SECRET: Type.String({ minLength: 1 }),
    SPOTIFY_CLIENT_ID: Type.Optional(Type.String()),
    SPOTIFY_CLIENT_SECRET: Type.Optional(Type.String()),
    STEAM_ID: Type.Optional(Type.String()),
    NGROK_AUTH_TOKEN: Type.Optional(Type.String({ minLength: 1 })),
    EVENT_SUB_SECRET: Type.Optional(Type.String({ minLength: 1 })),
    NODE_ENV: Type.Union(
        [Type.Literal('development'), Type.Literal('production')],
        { default: 'development' },
    ),
})

type Env = StaticDecode<typeof EnvSchema>

const coerced = Value.Convert(EnvSchema, { ...process.env })
const withDefaults = Value.Default(EnvSchema, coerced)

if (!Value.Check(EnvSchema, withDefaults)) {
    const errors = [...Value.Errors(EnvSchema, withDefaults)]

    log.app.error('Invalid environment variables')
    // REVIEW: check this
    errors.forEach(({ path, message }) =>
        log.app.error(`   ${path}: ${message}`),
    )
    process.exit(2)
}

export const config = Value.Decode(EnvSchema, withDefaults) as Env
