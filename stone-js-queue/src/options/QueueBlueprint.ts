import { QueueConfig, JobHandlerMeta } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { QueueServiceProvider } from '../QueueServiceProvider'

/**
 * The `stone.queue` configuration bucket.
 */
export interface QueueModuleConfig extends QueueConfig {}

/**
 * Application config augmented with the queue bucket.
 */
export interface QueueAppConfig extends Partial<AppConfig> {
  queue: QueueModuleConfig
}

/**
 * Blueprint for the queue module.
 */
export interface QueueBlueprint extends StoneBlueprint {
  stone: QueueAppConfig
}

/**
 * Opt-in blueprint: import and register it to enable the queue.
 *
 * It contributes the {@link QueueServiceProvider}, which binds `queueManager`, the default
 * connection as `queue`, the `jobRegistry` and a `worker`. Configure connections/handlers under
 * `stone.queue` (or use `@Queue()` / `@JobHandler()`). `stone.providers` is an array, so this merges.
 */
export const queueBlueprint: QueueBlueprint = {
  stone: {
    queue: {},
    providers: [
      QueueServiceProvider
    ]
  }
}

/**
 * Build a queue configuration fragment imperatively (for `defineConfig`/meta-modules).
 *
 * @param config - The queue configuration.
 * @returns A partial app config carrying the `queue` bucket.
 */
export function defineQueue (config: QueueModuleConfig): { queue: QueueModuleConfig } {
  return { queue: config }
}

/**
 * Build a job-handler meta-module for imperative registration under `stone.queue.handlers`.
 *
 * @param name - The job name.
 * @param handler - The handler function, instance, class or factory.
 * @param options - Whether it is a class/factory and which method to call.
 * @returns A job-handler meta-module.
 *
 * @example
 * ```typescript
 * defineQueue({ handlers: [ defineJobHandler('send-email', SendEmail, { isClass: true }) ] })
 * ```
 */
export function defineJobHandler (
  name: string,
  handler: unknown,
  options: { isClass?: boolean, isFactory?: boolean, action?: string } = {}
): JobHandlerMeta {
  return { name, module: handler, ...options }
}
