import {
  IContainer,
  IServiceProvider,
  defineHookListener,
  defineServiceProvider,
  AdapterHookListenerContext
} from '@stone-js/core'
import { Config } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { getClient, closeClient, createClient } from '../database/DatabaseClient'

/**
 * Factory Drizzle Service Provider
 *
 * In this example, we are using both ServiceProvider to bind the drizzle instance to the container
 * And AdapterHook to start and stop the drizzle client
 */
export function factoryDrizzleServiceProvider (container: IContainer): IServiceProvider {
  return {
    /**
     * Register services to the container
     */
    register (): void {
      container
        .instanceIf('drizzle', drizzle(getClient()))
        .alias('drizzle', ['db', 'database'])
    }
  }
}

/**
 * On start hook that will be called
 * once when the application starts
 *
 * @param context - The adapter hook listener context
 */
export const startDatabase = defineHookListener(({ blueprint }: AdapterHookListenerContext): void => {
  createClient(
    blueprint.get<Config>('database', { url: 'file:local.db' })
  )
}, { name: 'onStart' })

/**
 * On stop hook that will be called
 * once when the application stops
 *
 * @param context - The adapter hook listener context
 */
export const closeDatabase = defineHookListener((): void => {
  closeClient()
}, { name: 'onStop' })

/**
 * Drizzle Service Provider
 */
export const DrizzleServiceProvider = defineServiceProvider(factoryDrizzleServiceProvider)
