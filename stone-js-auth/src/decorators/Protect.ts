import { PROTECT_KEY } from './constants'
import { addMetadata, methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * What a handler requires of its caller: authentication alone, or authentication plus scopes.
 */
export type ProtectInput = true | string | string[]

/**
 * What `@Protect` records for one handler method.
 */
export interface ProtectMetadata {
  /** The decorated method's name, so the requirement can be found again at request time. */
  action: string | symbol
  /** What that method requires. */
  auth: ProtectInput
}

/**
 * Method decorator: state what a handler requires of its caller.
 *
 * ```ts
 * @Protect()                    // authenticated
 * @Protect('tasks:write')       // authenticated, holding that scope
 * @Protect(['a', 'b'])          // authenticated, holding both
 * ```
 *
 * Like `@Validate` and `@Returns`, this knows nothing about the router: the requirement is recorded
 * on the handler under this module's own key, so it holds in a routed application, a single-handler
 * service, a CLI command or the browser. When a router is in play you may put it on the route instead
 * (`@Get('/me', { auth: true })`), which keeps everything a route does in one place.
 *
 * Stating it on the handler rather than wiring a guard by hand is what lets `@stone-js/openapi`
 * publish the endpoint as protected: a requirement that only exists inside a middleware list cannot
 * be read by anything else.
 *
 * @param auth - What the handler requires. Defaults to authentication alone.
 * @returns A method decorator.
 */
export const Protect = <T extends Function = Function>(auth: ProtectInput = true): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>((_target: T, context: ClassMethodDecoratorContext<T>): undefined => {
    addMetadata(context as ClassMethodDecoratorContext, PROTECT_KEY, { action: context.name, auth })
  })
}
