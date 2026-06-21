import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { Migrator } from '@mikro-orm/migrations'
import { defineConfig } from '@mikro-orm/sqlite'
// import { config } from './config.js'

export default defineConfig({
  dbName: 'src/core/db/sqlite.db',
  // folder-based discovery setup, using common filename suffix
  entities: ['build/core/db/models/*.entity.js'],
  entitiesTs: ['src/core/db/models/*.entity.ts'],
  // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
  // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
  metadataProvider: TsMorphMetadataProvider,
  // enable debug to log sql queries and discovery information
  debug: process.env.NODE_ENV === 'development' ? true : false,
  extensions: [Migrator],
  migrations: {
    tableName: 'digittron_migrations',
    path: './src/core/db/migrations',
    pathTs: './src/core/db/migrations',
    glob: '*.{js,ts}',
  },
})
