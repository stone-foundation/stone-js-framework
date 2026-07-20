import { AuthorizationError } from '../errors/AuthorizationError'
import { Action, AppAbility, Subject } from '../declarations'
import { IncomingEvent, NextMiddleware, OutgoingResponse, FunctionalMiddleware } from '@stone-js/core'

/**
 * Route guard that authorizes `action` on `subject` against the request's ability.
 *
 * Reads the ability attached by `AbilityMiddleware`; if it is missing or denies the action, it
 * throws an `AuthorizationError` (403). Attach it to a route's `middleware`
 * (`@Delete('/posts/:id', { middleware: [authorize('delete', 'Post')] })`). The same CASL rules
 * power the frontend, so the UI and the API stay in lockstep.
 *
 * @param action - The action (e.g. `'update'`, `'delete'`, `'manage'`).
 * @param subject - The subject type or instance.
 * @param field - Optional field-level check.
 * @returns A functional middleware.
 */
export function authorize (action: Action, subject: Subject, field?: string): FunctionalMiddleware<IncomingEvent, OutgoingResponse> {
  return async (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> => {
    const ability = event.getMetadataValue<AppAbility>('ability')

    if (ability === undefined || ability.cannot(action, subject, field)) {
      throw new AuthorizationError(`You are not allowed to ${action} ${typeof subject === 'string' ? subject : 'resource'}.`)
    }

    return await next(event)
  }
}
