import { type Options, SqliteDriver } from '@mikro-orm/sqlite'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { Migrator } from '@mikro-orm/migrations'
import { SeedManager } from '@mikro-orm/seeder'

const config: Options = {
    driver: SqliteDriver,
    dbName: './db/sqlite.db',
    // folder-based discovery setup, using common filename suffix
    entities: ['build/lib/db/models/*.entity.js'],
    entitiesTs: ['src/lib/db/models/*.entity.ts'],
    // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
    // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
    metadataProvider: TsMorphMetadataProvider,
    // enable debug to log sql queries and discovery information
    debug: process.env.NODE_ENV === 'development' ? true : false,
    extensions: [Migrator, SeedManager],
    migrations: {
        tableName: 'digittron_migrations',
        path: './build/lib/db/migrations',
        pathTs: './src/lib/db/migrations',
        glob: '*.{js,ts}',
    },
    seeder: {
        path: './build/lib/db/seeders',
        pathTs: './src/lib/db/seeders',
        defaultSeeder: 'DatabaseSeeder',
        glob: '!(*.d).{js,ts}',
        emit: process.env.NODE_ENV === 'development' ? 'ts' : 'js',
    },
}

export default config
