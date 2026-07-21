import { cloneValue } from '@stone-js/config'
import { ConnectionConfig } from '../declarations'
import { queueBlueprint } from '../options/QueueBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@Queue` decorator: a single connection's configuration (the `driver` is required).
 */
export interface QueueOptions extends Partial<ConnectionConfig> {
  driver: ConnectionConfig['driver']
}

/**
 * Class decorator: enable the queue with a single connection, declaratively.
 *
 * `@Queue({ driver: 'memory' })` registers the {@link QueueServiceProvider} and sets that connection
 * as the default. For multiple connections or richer setups, configure `stone.queue` via
 * `@Configuration()` (or the imperative `queueBlueprint` / `defineQueue`) instead.
 *
 * @param options - The connection configuration (driver required).
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { Queue } from '@stone-js/queue'
 *
 * @Queue({ driver: 'redis', url: 'redis://localhost:6379' })
 * @StoneApp({ name: 'app' })
 * export class Application {}
 * ```
 */
export const Queue = <T extends ClassType = ClassType>(options: QueueOptions): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(queueBlueprint)
    const name = options.name ?? String(options.driver)

    blueprint.stone.queue.default = name
    blueprint.stone.queue.connections = [{ ...options, name }]

    addBlueprint(target, context, blueprint)
  })
}
