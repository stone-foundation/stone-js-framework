import { VALIDATE_KEY } from './constants'
import { RouteValidationInput } from '../sources'
import { addMetadata, methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * What a handler declares it accepts: a schema (the body), a map of schemas by source, or the alias
 * of a schema class registered with `@ValidationSchema`.
 */
export type ValidateInput = RouteValidationInput | string

/**
 * What `@Validate` records for one handler method.
 */
export interface ValidateMetadata {
  /** The decorated method's name, so the declaration can be found again at request time. */
  action: string | symbol
  /** What that method accepts. */
  validation: ValidateInput
}

/**
 * Method decorator: declare what a handler accepts.
 *
 * ```ts
 * @Validate(CreateUserSchema)                       // the body
 * @Validate({ body: CreateUserSchema, query: Page }) // several sources
 * @Validate('createUser')                            // a registered schema class
 * ```
 *
 * This knows nothing about the router, and that is the point: the declaration is recorded on the
 * handler itself, under this module's own key, so validation runs the same in a routed application,
 * a single-handler service, a CLI command or the browser. When a router *is* in play you may instead
 * put it on the route (`@Post('/users', { validation: … })`), which keeps the method uncluttered and
 * puts everything a route does in one place; both forms end up in the same middleware.
 *
 * @param validation - What the handler accepts.
 * @returns A method decorator.
 */
export const Validate = <T extends Function = Function>(validation: ValidateInput): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>((_target: T, context: ClassMethodDecoratorContext<T>): undefined => {
    addMetadata(context as ClassMethodDecoratorContext, VALIDATE_KEY, { action: context.name, validation })
  })
}
