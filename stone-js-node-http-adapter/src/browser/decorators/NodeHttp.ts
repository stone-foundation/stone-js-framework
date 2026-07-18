import { classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { NodeHttpAdapterAdapterConfig } from '../../options/NodeHttpAdapterBlueprint'

/**
 * Interface for configuring the `NodeHttp` decorator.
 *
 * This interface extends `NodeHttpAdapterConfig` and allows partial customization
 * of the Node.js HTTP adapter blueprint configuration.
 */
export interface NodeHttpOptions extends Partial<NodeHttpAdapterAdapterConfig> {}

/**
 * A class decorator for registering a Node.js HTTP adapter in the Stone.js framework.
 *
 * The decorator modifies the `nodeHttpAdapterBlueprint` by merging the provided options
 * with the default configuration. It also registers the blueprint to the target class using
 * the `addBlueprint` utility.
 *
 * NB: This decorator is stubbed for browser environments compatibility and does not
 * perform any actual functionality in the browser. It is intended for use in Node.js environments
 * where the Node.js HTTP adapter is applicable.
 *
 * @template T - The type of the class being decorated, defaulting to `ClassType`.
 *
 * @param options - An object containing configuration options for the Node.js HTTP adapter.
 *
 * @returns A class decorator function.
 *
 * @example
 * ```typescript
 * import { NodeHttp } from '@stone-js/node-http';
 *
 * @NodeHttp({
 *   url: 'http://localhost:3000',
 *   default: true,
 * })
 * class MyHttpService {
 *   // Service implementation
 * }
 * ```
 */
export const NodeHttp = <T extends ClassType = ClassType>(_options: NodeHttpOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((_target: T, _context: ClassDecoratorContext<T>): undefined => {})
}
