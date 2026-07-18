import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Configuration
 */
export default defineConfig({
  out: './drizzle',
  dialect: 'sqlite',
  schema: './app/database/schema.ts',
  dbCredentials: {
    url: process.env.DB_FILE_NAME ?? 'file:local.db'
  },
})
