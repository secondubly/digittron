declare global {
    namespace NodeJS {
        interface ProcessEnv {
            API_PORT?: string
            TWITCH_ID: string
            BOT_ID: string
            CHANNELS: string
            CLIENT_ID: string
            CLIENT_SECRET: string
            SPOTIFY_CLIENT_ID: string
            SPOTIFY_CLIENT_SECRET: string
            JWT_SECRET?: string
            WEB_PORT?: string
            REDIS_HOST: string
            REDIS_PORT: string
        }
    }
}
