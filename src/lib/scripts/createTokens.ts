import { MikroORM } from '@mikro-orm/sqlite'
import config from '../../mikro-orm.config.js'
import { Token } from '../db/models/token.entity.js'

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

    const botToken = em.upsert(
        Token,
        {
            id: parseInt(process.env.TWITCH_ID!),
            accessToken: process.env.BOT_ACCESS_TOKEN!,
            refreshToken: process.env.BOT_REFRESH_TOKEN!,
        },
        {
            onConflictAction: 'ignore',
        },
    )

    await em.persist([twitchToken, botToken]).flush()
    await orm.close(true)
} catch (error) {
    console.error('Error creating records:', error)
}
