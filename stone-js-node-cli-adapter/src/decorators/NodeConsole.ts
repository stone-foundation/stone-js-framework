import { cloneValue } from '@stone-js/config'
import deepmerge from 'deepmerge'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { nodeConsoleAdapterBlueprint, NodeConsoleAdapterAdapterConfig } from '../options/NodeConsoleAdapterBlueprint'

/**
 * Configuration options for the `NodeConsole` decorator.
 * These options extend the default Node Cli adapter configuration.
 */
export interface NodeConsoleOptions extends Partial<NodeConsoleAdapterAdapterConfig> {}

/**
 * A Stone.js decorator that integrates the Node Cli Adapter with a class.
 *
 * This decorator modifies the class to seamlessly enable Node Cli as the
 * execution environment for a Stone.js application. By applying this decorator,
 * the class is automatically configured with the necessary blueprint for Node Cli.
 *
 * @template T - The type of the class being decorated. Defaults to `ClassType`.
 * @param options - Optional configuration to customize the Node Cli Adapter.
 *
 * @returns A class decorator that applies the Node Cli adapter configuration.
 *
 * @example
 * ```typescript
 * import { NodeConsole } from '@stone-js/node-cli-adapter';
 *
 * @NodeConsole({
 *   alias: 'NodeConsole',
 * })
 * class App {
 *   // Your application logic here
 * }
 * ```
 */
export const NodeConsole = <T extends ClassType = ClassType>(options: NodeConsoleOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would accumulate options across classes and leak between two applications
    // built together). Every other adapter decorator already does this.
    const blueprint = cloneValue(nodeConsoleAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepmerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
