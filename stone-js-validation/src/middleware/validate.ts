import { Validator } from '../Validator'
import { validateEvent, ValidationRules } from '../validateEvent'
import { IncomingEvent, OutgoingResponse, FunctionalMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Builds a route middleware that validates the event's inputs before the handler runs.
 *
 * Attach it to any route's `middleware` — declarative
 * (`@Post('/users', { middleware: [validate({ name: NameSchema })] })`) or imperative
 * (route definition `middleware: [validate({ ... })]`). On failure it throws a
 * `ValidationError` (map it to `422` + problem+json in your HTTP error handler); on success the
 * handler runs untouched. The same schema works on the frontend via the `Validator` service —
 * one schema, both sides.
 *
 * @param rules - The validation rules (event key → schema).
 * @returns A functional middleware.
 */
export function validate (rules: ValidationRules): FunctionalMiddleware<IncomingEvent, OutgoingResponse> {
  const validator = Validator.create()

  return async (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> => {
    validateEvent(event, rules, validator)
    return await next(event)
  }
}
