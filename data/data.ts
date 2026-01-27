const data = {
    tokens: [
        {
            id: process.env.TWITCH_ID!,
            twitchAccessToken: {
                access_token: process.env.TWITCH_ACCESS_TOKEN!,
                refreshToken: process.env.TWITCH_REFRESH_TOKEN!,
                obtainmentTimestamp: 0,
                expiresIn: 0,
            },
            spotifyAccessToken: {
                access_token: process.env.SPOTIFY_ACCESS_TOKEN,
                refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
                expiresIn: 0,
                tokenType: 'Bearer',
            },
        },
        {
            id: process.env.BOT_ID!,
            twitchAccessToken: {
                access_token: process.env.BOT_ACCESS_TOKEN!,
                refreshToken: process.env.BOT_REFRESH_TOKEN!,
                obtainmentTimestamp: 0,
                expiresIn: 0,
            },
        },
    ],
}

export default data
