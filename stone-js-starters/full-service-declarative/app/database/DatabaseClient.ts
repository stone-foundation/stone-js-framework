import { Client, Config, createClient } from '@libsql/client'

/* eslint-disable @typescript-eslint/no-extraneous-class */

/**
 * DatabaseClient
*/
export class DatabaseClient {
  private static _client?: Client

  /**
   * The client instance
   */
  static get client (): Client {
    if (this._client === undefined) {
      throw new Error('Database client is not initialized.')
    }
    return this._client
  }

  /**
   * Create a new client instance
   *
   * @param config - The configuration object for the client
   * @returns The client instance
   */
  static create (config: Config): Client {
    if (this._client === undefined) {
      this._client = createClient(config)
    }
    return this._client
  }

  /**
   * Close the client instance
   */
  static close (): void {
    if (this._client !== undefined) {
      this._client.close()
      this._client = undefined
    }
  }
}
