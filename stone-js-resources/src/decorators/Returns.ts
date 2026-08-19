import { IResource } from '../declarations'
import { RETURNS_KEY } from './constants'
import { addMetadata, methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * What a handler declares it exposes: a resource, or the alias of a resource class registered with
 * `@ApiResource`.
 */
export type ReturnsInput = IResource<any, any> | string

/**
 * What `@Returns` records for one handler method.
 */
export interface ReturnsMetadata {
  /** The decorated method's name, so the declaration can be found again at request time. */
  action: string | symbol
  /** What that method exposes. */
  resource: ReturnsInput
}

/**
 * Method decorator: declare what a handler exposes.
 *
 * ```ts
 * @Returns(userResource)   // the resource itself
 * @Returns('user')         // a registered resource class
 * ```
 *
 * The counterpart of `@Validate`: one says what comes in, the other what goes out, and between them
 * the handler is free to return its domain model whole. Whatever the model gains later, a password
 * hash, an internal flag, does not leak, because the resource decides what leaves.
 *
 * Like `@Validate`, this knows nothing about the router. The declaration is recorded on the handler
 * under this module's own key, so it works in a routed application, a single-handler service, a CLI
 * command or the browser. When a router is in play you may put it on the route instead
 * (`@Get('/users/:id', { resource: userResource })`), which keeps everything a route does in one
 * place; both forms end up in the same middleware.
 *
 * @param resource - What the handler exposes.
 * @returns A method decorator.
 */
export const Returns = <T extends Function = Function>(resource: ReturnsInput): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>((_target: T, context: ClassMethodDecoratorContext<T>): undefined => {
    addMetadata(context as ClassMethodDecoratorContext, RETURNS_KEY, { action: context.name, resource })
  })
}
