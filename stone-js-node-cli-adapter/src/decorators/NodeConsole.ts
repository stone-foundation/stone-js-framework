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
    if (nodeConsoleAdapterBlueprint.stone?.adapters?.[0] !== undefined) {
      // Merge provided options with the default Node Cli adapter blueprint.
      nodeConsoleAdapterBlueprint.stone.adapters[0] = deepmerge(nodeConsoleAdapterBlueprint.stone.adapters[0], options)
    }

    // Add the modified blueprint to the target class.
    addBlueprint(target, context, nodeConsoleAdapterBlueprint)
  })
}
