import type { Dictionary, EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { Token } from '../../src/lib/db/models/token.entity.js'
import data from '../data.js'

export class TokenSeeder extends Seeder {
    async run(em: EntityManager, _context: Dictionary): Promise<void> {
        for (const tokenData of data.tokens) {
            const { twitchAccessToken, spotifyAccessToken } = tokenData
            const token = new Token()

            token.id = parseInt(tokenData.id)
            token.twitchAccessToken = JSON.stringify(twitchAccessToken)

            if (spotifyAccessToken !== null) {
                token.spotifyAccessToken = JSON.stringify(spotifyAccessToken)
            }
            em.persist(token)
        }
        await em.flush()
    }
}
