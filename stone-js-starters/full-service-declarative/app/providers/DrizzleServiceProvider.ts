import {
  Hook,
  Provider,
  IContainer,
  IServiceProvider,
  AdapterHookListenerContext
} from '@stone-js/core'
import { Config } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { DatabaseClient } from '../database/DatabaseClient'

/**
 * Drizzle Service Provider
 *
 * In this example, we are using both ServiceProvider to bind the drizzle instance to the container
 * And AdapterHook to start and stop the drizzle client
 */
@Provider()
export class DrizzleServiceProvider implements IServiceProvider {
  /**
   * Create a new instance of DrizzleServiceProvider
   *
   * @param options
   */
  constructor (private readonly container: IContainer) {}

  /**
   * On start hook that will be called
   * once when the application starts
   *
   * @param context - The adapter hook listener context
   */
  @Hook('onStart')
  onStart ({ blueprint }: AdapterHookListenerContext): void {
    DatabaseClient.create(
      blueprint.get<Config>('database', { url: 'file:local.db' })
    )
  }

  /**
   * Register services to the container
   */
  register (): void {
    this.container
      .instanceIf('drizzle', drizzle(DatabaseClient.client))
      .alias('drizzle', ['db', 'database'])
  }

  /**
   * On stop hook that will be called
   * once when the application stops
   *
   * @param context - The adapter hook listener context
   */
  @Hook('onStop')
  onStop (): void {
    DatabaseClient.close()
  }
}
