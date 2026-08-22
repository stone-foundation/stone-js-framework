import { CAN_KEY } from './constants'
import { Action, Subject } from '../declarations'
import { addMetadata, methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * What a route or a handler authorizes: an action on a subject, optionally narrowed to a field, or
 * the name of a policy registered with `@Policy`.
 */
export interface CanRule {
  action: Action
  subject: Subject
  field?: string
}

/** What a route's `authz` option, or `@Can`, may hold. */
export type CanInput = CanRule | string | Array<CanRule | string>

/**
 * What `@Can` records for one handler method.
 */
export interface CanMetadata {
  /** The decorated method's name, so the rule can be found again at request time. */
  action: string | symbol
  /** What that method authorizes. */
  authz: CanInput
}

/**
 * Method decorator: state what a handler authorizes.
 *
 * ```ts
 * @Can('update', 'Post')            // the ability the caller must hold
 * @Can('update', 'Post', 'title')   // narrowed to a field
 * @Can('post.update')               // a registered policy
 * ```
 *
 * Like `@Protect`, `@Validate` and `@Returns`, this knows nothing about the router: the rule is
 * recorded on the handler under this module's own key, so it holds in a routed application, a
 * single-handler service, a CLI command or the browser. A router, when present, can carry it on the
 * route instead (`{ authz: { action: 'update', subject: 'Post' } }`).
 *
 * Declaring the rule rather than wiring a guard is what makes it readable: `@stone-js/openapi`
 * publishes the endpoint as protected, and a policy can be inspected, tested and reused.
 *
 * @param action - The action, or a registered policy name when it is the only argument.
 * @param subject - The subject type or instance.
 * @param field - An optional field-level narrowing.
 * @returns A method decorator.
 */
export const Can = <T extends Function = Function>(action: Action | string, subject?: Subject, field?: string): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>((_target: T, context: ClassMethodDecoratorContext<T>): undefined => {
    const authz: CanInput = subject === undefined
      ? action // a lone argument names a policy
      : { action, subject, field }
    addMetadata(context as ClassMethodDecoratorContext, CAN_KEY, { action: context.name, authz })
  })
}
