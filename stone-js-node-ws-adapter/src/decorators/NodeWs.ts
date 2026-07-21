import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { nodeWsAdapterBlueprint, NodeWsAdapterAdapterConfig } from '../options/NodeWsAdapterBlueprint'

/**
 * Options for the `@NodeWs` decorator.
 */
export interface NodeWsOptions extends Partial<NodeWsAdapterAdapterConfig> {}

/**
 * Class decorator: enable the Node.js WebSocket adapter for a Stone.js application.
 *
 * Registers the `node_ws` adapter. Combine with `@Realtime()` (from `@stone-js/realtime`) to wire
 * gateways, channels and presence: this adapter populates the realtime connection store and
 * dispatches connection lifecycle events into the realtime router.
 *
 * @param options - Optional adapter configuration.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { NodeWs } from '@stone-js/node-ws-adapter'
 * import { Realtime } from '@stone-js/realtime'
 *
 * @NodeWs({ url: 'ws://localhost:8080' })
 * @Realtime({ driver: 'memory' })
 * @StoneApp({ name: 'app' })
 * export class Application {}
 * ```
 */
export const NodeWs = <T extends ClassType = ClassType>(options: NodeWsOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(nodeWsAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
