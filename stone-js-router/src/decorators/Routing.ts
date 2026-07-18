import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { RouterBlueprint, routerBlueprint, RouterConfig } from '../options/RouterBlueprint'

/**
 * Options for the `Routing` decorator, extending router configuration.
 */
export interface RoutingOptions extends Partial<RouterConfig> {}

/**
 * A class decorator for configuring routing behavior.
 *
 * @param options - Configuration options for the router.
 * @returns A class decorator configured for routing.
 *
 * @example
 * ```typescript
 * @Routing({ prefix: '/api' })
 * class Application {}
 * ```
 */
export const Routing = <T extends ClassType = ClassType>(options: RoutingOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    addBlueprint(target, context, routerBlueprint, { stone: { router: options } } as unknown as RouterBlueprint)
  })
}
