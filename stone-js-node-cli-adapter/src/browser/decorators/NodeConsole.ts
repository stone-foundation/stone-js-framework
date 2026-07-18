import { classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { NodeConsoleAdapterAdapterConfig } from '../../options/NodeConsoleAdapterBlueprint'

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
 * NB: This decorator is stubbed for browser environments compatibility and does not
 * perform any actual functionality in the browser. It is intended for use in Node.js environments
 * where the Node.js HTTP adapter is applicable.
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
export const NodeConsole = <T extends ClassType = ClassType>(_options: NodeConsoleOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((_target: T, _context: ClassDecoratorContext<T>): undefined => {})
}
