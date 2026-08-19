import { VALIDATED_METADATA_KEY } from './middleware/ValidateRouteMiddleware'

/** A duck-typed event carrying request-scoped metadata. */
interface MetadataEvent {
  getMetadataValue?: <T = unknown>(key: string, fallback?: T) => T | undefined
}

/**
 * The parsed input a route declared, as the schema produced it.
 *
 * A schema does not only accept or reject: it coerces and strips. `z.coerce.number()` turns `"42"`
 * into `42`, and a strict object drops what you did not declare. Reading the raw input again after
 * validating is how an application validates one value and uses another, so read it from here.
 *
 * Returns `undefined` when the route declared no validation, which is the honest answer: nothing was
 * validated, so there is nothing parsed to hand back.
 *
 * @param event - The incoming event.
 * @returns The parsed values, keyed as the rules were.
 *
 * @example
 * ```typescript
 * @Post('/users', { validation: { body: CreateUserSchema } })
 * create (event: IncomingHttpEvent) {
 *   const { body } = validated<{ body: CreateUser }>(event) ?? {}
 *   return this.users.add(body)
 * }
 * ```
 */
export function validated<T extends Record<string, unknown> = Record<string, unknown>> (
  event: MetadataEvent
): T | undefined {
  return event.getMetadataValue?.<T>(VALIDATED_METADATA_KEY)
}
