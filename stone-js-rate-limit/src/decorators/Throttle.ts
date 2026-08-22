import { THROTTLE_KEY } from './constants'
import { RateLimitInput } from '../declarations'
import { addMetadata, methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Declare what a handler method is throttled by.
 *
 * The form that needs no router: a single-handler application, a command, a queue consumer. When a
 * router is in play, declaring it on the route is usually better, because the route is then the single
 * description of itself and a group can compose its own budget on top.
 *
 * @param rateLimit - One rule, or several that all apply.
 * @returns A method decorator.
 *
 * @example
 * ```ts
 * class AuthController {
 *   @Throttle({ max: 3, window: 900, by: 'email' })
 *   sendCode (event: IncomingHttpEvent) { … }
 * }
 * ```
 */
export const Throttle = <T extends Function = Function>(rateLimit: RateLimitInput): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>((_target: T, context: ClassMethodDecoratorContext<T>): undefined => {
    addMetadata(context as ClassMethodDecoratorContext, THROTTLE_KEY, { action: context.name, rateLimit })
  })
}
