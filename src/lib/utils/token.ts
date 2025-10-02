import { EntityManager, MikroORM } from "@mikro-orm/sqlite"
import logger from "../../logger.js"
import { Token } from "../db/models/token.entity.js"
import config from "../../mikro-orm.config.js"

const createTokenString = (accessToken: string, refreshToken: string, scopes: string[] = []): string => {
    return JSON.stringify({
        accessToken,
        refreshToken,
        scope: scopes,
        expiresIn: 0,
        obtainmentTimestamp: 0
    })
}

export const getToken = async (id: string, scopes: string[] = []): Promise<string | null> => {
    let orm: MikroORM
    let em: EntityManager

    try {
        orm = await MikroORM.init(config)
        em = orm.em.fork()

        const tokensTable = em.getRepository(Token)

        const token = await tokensTable.findOne({
            id: parseInt(id)
        })

        if (!token) {
            throw new Error(`Access token for ${id} not found in database or cache.`)
        }

        return createTokenString(token.accessToken, token.refreshToken, scopes)
    } catch (error) {
        logger.error(error)
        return null
    }
}