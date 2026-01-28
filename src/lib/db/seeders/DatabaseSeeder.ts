import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { Token } from '../models/token.entity.js'
import tokens from '../data.json' with { type: 'json' }

export class DatabaseSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        const count = await em.count(Token)
        // only seed if table doesn't have existing records
        if (count > 0) {
            return
        }

        for (const token of tokens) {
            if ('user_id' in token) {
                if (token.spotifyAccessToken) {
                    em.create(Token, {
                        id: parseInt(token.user_id),
                        twitchAccessToken: JSON.stringify({
                            accessToken: token.twitchAccessToken.accessToken,
                            refreshToken: token.twitchAccessToken.refreshToken,
                            obtainmentTimestamp: 0,
                            expiresIn: 0,
                        }),
                        spotifyAccessToken: JSON.stringify({
                            access_token: token.spotifyAccessToken.access_token,
                            refresh_token:
                                token.spotifyAccessToken.refresh_token,
                            expires_in: token.spotifyAccessToken.expires_in,
                            token_type: token.spotifyAccessToken.token_type,
                        }),
                    })
                } else {
                    em.create(Token, {
                        id: parseInt(token.user_id),
                        twitchAccessToken: JSON.stringify({
                            accessToken: token.twitchAccessToken.accessToken,
                            refreshToken: token.twitchAccessToken.refreshToken,
                            obtainmentTimestamp: 0,
                            expiresIn: 0,
                        }),
                    })
                }
            } else if ('bot_id' in token) {
                em.create(Token, {
                    id: parseInt(token.bot_id),
                    twitchAccessToken: JSON.stringify({
                        accessToken: token.twitchAccessToken.accessToken,
                        refreshToken: token.twitchAccessToken.refreshToken,
                        obtainmentTimestamp: 0,
                        expiresIn: 0,
                    }),
                })
            } else {
                throw new TypeError('Missing valid id type')
            }
        }
    }
}
