import { cloneValue } from '@stone-js/config'
import { ConnectionOptions } from '../declarations'
import { realtimeBlueprint } from '../options/RealtimeBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@Realtime` decorator: a single connection's configuration (`driver` required).
 */
export interface RealtimeOptions extends Partial<ConnectionOptions> {
  driver: ConnectionOptions['driver']
  /** The client endpoint (WebSocket URL) used by the isomorphic client. */
  url?: string
}

/**
 * Class decorator: enable realtime with a single connection, declaratively.
 *
 * `@Realtime({ driver: 'memory' })` registers the {@link RealtimeServiceProvider} and sets that
 * connection as the default. For multiple connections or richer setups, configure `stone.realtime`
 * via `@Configuration()` (or the imperative `realtimeBlueprint` / `defineRealtime`) instead.
 *
 * @param options - The connection configuration (driver required).
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { Realtime } from '@stone-js/realtime'
 *
 * @Realtime({ driver: 'redis', url: 'redis://localhost:6379' })
 * @StoneApp({ name: 'app' })
 * export class Application {}
 * ```
 */
export const Realtime = <T extends ClassType = ClassType>(options: RealtimeOptions): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(realtimeBlueprint)
    const name = options.name ?? String(options.driver)
    const { url, ...connection } = options

    blueprint.stone.realtime.default = name
    blueprint.stone.realtime.connections = [{ ...connection, name }]
    if (url !== undefined) { blueprint.stone.realtime.url = url }

    addBlueprint(target, context, blueprint)
  })
}
