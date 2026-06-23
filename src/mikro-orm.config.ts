import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { Migrator } from '@mikro-orm/migrations'
import { defineConfig } from '@mikro-orm/sqlite'
import path from 'path'

let dbPath: string

if (process.env.NODE_ENV === 'production') {
  dbPath = '/app/data/sqlite.db'
} else {
  dbPath = path.join(process.cwd(), 'db', 'sqlite.db')
}

export default defineConfig({
  dbName: dbPath,
  // folder-based discovery setup, using common filename suffix
  entities: ['build/core/db/models/*.entity.js'],
  entitiesTs: ['src/core/db/models/*.entity.ts'],
  allowGlobalContext: true, // create /app/data/ directory if it doesn't exist in prod
  // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
  // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
  metadataProvider: TsMorphMetadataProvider,
  // enable debug to log sql queries and discovery information
  debug: process.env.NODE_ENV === 'production' ? false : true,
  extensions: [Migrator],
  migrations: {
    tableName: 'digittron_migrations',
    path: './build/core/db/migrations',
    pathTs: './src/core/db/migrations',
  },
  discovery: {
    warnWhenNoEntities: true,
  },
  ensureDatabase: true
})
