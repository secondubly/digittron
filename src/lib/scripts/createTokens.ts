import { MikroORM } from '@mikro-orm/sqlite'
import config from '../../mikro-orm.config.js'
import * as dotenv from 'dotenv'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { Token } from '../db/models/token.entity.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../../../.env') })

try {
    const orm = await MikroORM.init(config)
    const em = orm.em.fork()

    const twitchToken = em.upsert(
        Token,
        {
            id: parseInt(process.env.TWITCH_ID!),
            accessToken: process.env.TWITCH_ACCESS_TOKEN!,
            refreshToken: process.env.TWITCH_REFRESH_TOKEN!,
        },
        {
            onConflictAction: 'ignore',
        },
    )

    await em.persistAndFlush(twitchToken)
    await orm.close(true)
} catch (error) {
    console.error('Error creating records:', error)
}
