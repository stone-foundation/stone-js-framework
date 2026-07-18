import { Client, Config, createClient as baseCreateClient } from '@libsql/client'

/**
 * DatabaseClient
*/
let dbClient: Client | undefined

/**
 * The client instance
 */
export function getClient (): Client {
  if (dbClient === undefined) {
    throw new Error('Database client is not initialized.')
  }
  return dbClient
}

/**
 * Create a new client instance
 *
 * @param config - The configuration object for the client
 * @returns The client instance
 */
export function createClient (config: Config): Client {
  if (dbClient === undefined) {
    dbClient = baseCreateClient(config)
  }
  return dbClient
}

/**
 * Close the client instance
 */
export function closeClient (): void {
  if (dbClient !== undefined) {
    dbClient.close()
    dbClient = undefined
  }
}
