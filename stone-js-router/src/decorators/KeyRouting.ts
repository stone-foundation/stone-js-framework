import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { KeyRoutingConfig } from '../keyRoutingDeclarations'
import { KeyRoutingBlueprint, keyRoutingBlueprint } from '../options/KeyRoutingBlueprint'

/**
 * Options for the `@KeyRouting` decorator.
 */
export interface KeyRoutingOptions extends KeyRoutingConfig {}

/**
 * Class decorator: enable the light key-router (route events by key, not by path).
 *
 * The event-routing sibling of `@Routing()`: it makes the light router the kernel event handler, so
 * any adapter that runs the kernel routes its events, keyed by a configurable property, to the
 * matching handler (bus events, realtime gateways, CLI commands...). Mutually exclusive with
 * `@Routing()`. Bundlers tree-shake the full router away when only this is used.
 *
 * @param options - The key-routing configuration.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * @KeyRouting({ source: 'detail-type' })
 * @AwsLambda()
 * @StoneApp({ name: 'consumer' })
 * export class Application {}
 * ```
 */
export const KeyRouting = <T extends ClassType = ClassType>(options: KeyRoutingOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    addBlueprint(target, context, keyRoutingBlueprint, { stone: { keyRouting: options } } as unknown as KeyRoutingBlueprint)
  })
}
