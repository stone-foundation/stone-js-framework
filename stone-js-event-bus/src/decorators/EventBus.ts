import { cloneValue } from '@stone-js/config'
import { ConnectionOptions } from '../declarations'
import { eventBusBlueprint } from '../options/EventBusBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@EventBus` decorator: a single cloud connection (the `driver` is required), plus
 * the default emit targets.
 */
export interface EventBusOptions extends Partial<ConnectionOptions> {
  driver: ConnectionOptions['driver']
  /** The default emit targets (defaults to `['local', <driver>]`). */
  targets?: string[]
}

/**
 * Class decorator: enable the event bus with a single cloud connection, declaratively.
 *
 * `@EventBus({ driver: 'eventbridge' })` registers the {@link EventBusServiceProvider}, adds the
 * connection, and defaults emit to both `local` and that connection so the same code works in a
 * monolith and distributed. For richer setups, configure `stone.eventBus` via `@Configuration()`
 * (or `defineEventBus`).
 *
 * @param options - The connection configuration (driver required).
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * @EventBus({ driver: 'eventbridge', source: 'my.app' })
 * @StoneApp({ name: 'app' })
 * export class Application {}
 * ```
 */
export const EventBus = <T extends ClassType = ClassType>(options: EventBusOptions): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(eventBusBlueprint)
    const name = options.name ?? String(options.driver)
    const { targets, ...connection } = options

    blueprint.stone.eventBus.default = name
    blueprint.stone.eventBus.targets = targets ?? ['local', name]
    blueprint.stone.eventBus.connections = [{ ...connection, name }]

    addBlueprint(target, context, blueprint)
  })
}
