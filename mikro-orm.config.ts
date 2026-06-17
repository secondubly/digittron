import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { Migrator } from '@mikro-orm/migrations'
import { defineConfig } from '@mikro-orm/sqlite'
// import { config } from './config.js'

export default defineConfig({
    dbName: './db/sqlite.db',
    // folder-based discovery setup, using common filename suffix
    entities: ['build/lib/db/models/*.entity.js'],
    entitiesTs: ['src/lib/db/models/*.entity.ts'],
    // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
    // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
    metadataProvider: TsMorphMetadataProvider,
    // enable debug to log sql queries and discovery information
    debug: process.env.NODE_ENV === 'development' ? true : false,
    extensions: [Migrator],
    migrations: {
        tableName: 'digittron_migrations',
        path: './build/lib/db/migrations',
        pathTs: './src/lib/db/migrations',
        glob: '*.{js,ts}',
    },
})
