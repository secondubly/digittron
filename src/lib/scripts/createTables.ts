import { MikroORM } from "@mikro-orm/sqlite"
import config from "../../mikro-orm.config.js"
import logger from "../../logger.js"

try {
    const orm = await MikroORM.init(config)
    // create necesssary tables
    await orm.schema.refreshDatabase()
    logger.info('Database tables created successfully!')

    await orm.close(true)
} catch (error) {
    console.error('Error creating tables:', error)
}