import { type Options, SqliteDriver } from '@mikro-orm/sqlite'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { Migrator } from '@mikro-orm/migrations'

const config: Options = {
    driver: SqliteDriver,
    dbName: './data/sqlite.db',
    // folder-based discovery setup, using common filename suffix
    entities: ['build/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
    // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
    metadataProvider: TsMorphMetadataProvider,
    // enable debug to log sql queries and discovery information
    debug: true,
    extensions: [Migrator],
    migrations: {
        tableName: 'digittron_migrations',
        path: './build/data/migrations',
        pathTs: './data/migrations',
        glob: '*.{js,ts}',
    },
    seeder: {
        path: './build/data/seeders',
        pathTs: './data/seeders/',
        defaultSeeder: 'DatabaseSeeder',
        glob: '*.{js,ts}',
        emit: 'ts',
    },
}

export default config
