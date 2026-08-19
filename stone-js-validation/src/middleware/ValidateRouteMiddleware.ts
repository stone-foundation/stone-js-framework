import { Validator } from '../Validator'
import { validateEvent, ValidationRules } from '../validateEvent'
import { ValidationConfig } from '../options/ValidationBlueprint'
import { IBlueprint, IncomingEvent, NextMiddleware, OutgoingResponse, type MetaMiddleware } from '@stone-js/core'

/**
 * Where the parsed input is published on the event.
 *
 * Read it with {@link validated}, never by reaching for this key by hand: the name is an
 * implementation detail, the helper is the contract.
 */
export const VALIDATED_METADATA_KEY = 'validated'

/**
 * The shape a route's `validation` option may take: the rules themselves, or the name of a rule set
 * registered under `stone.validation.schemas`.
 */
export type RouteValidation = ValidationRules | string

/**
 * Route middleware: validates what a route declared, before its handler runs.
 *
 * A route says what it accepts, once, where the route is defined:
 *
 * ```ts
 * @Post('/users', { validation: { body: CreateUserSchema } })
 * ```
 *
 * This middleware reads that from the matched route and validates it. On success the **parsed**
 * value is published in the event's metadata, so the handler reads what the schema produced rather
 * than the raw input: a schema coerces and strips, and re-reading the raw value is how an
 * application validates one thing and uses another. On failure it throws a `ValidationError`
 * carrying every issue at once.
 *
 * The route stays the single description of itself, which is what lets `@stone-js/openapi` publish
 * the request schema without being told a second time.
 */
export class ValidateRouteMiddleware {
  private readonly blueprint: IBlueprint
  private readonly validator: Validator

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
    this.validator = Validator.create()
  }

  /**
   * Validate the matched route's declared input, then continue.
   *
   * @param event - The incoming event.
   * @param next - The next middleware.
   * @returns The response.
   */
  async handle (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> {
    const rules = this.rulesFor(event)

    if (rules !== undefined) {
      event.setMetadataValue(VALIDATED_METADATA_KEY, validateEvent(event, rules, this.validator))
    }

    return await next(event)
  }

  /**
   * The rules the matched route declared, with a registered name resolved to its rule set.
   *
   * @param event - The incoming event.
   * @returns The rules, or `undefined` when the route declares none.
   */
  private rulesFor (event: IncomingEvent): ValidationRules | undefined {
    // Duck-typed: the kernel is agnostic, and an event without a router carries no route at all.
    const declared = (event as unknown as { getRoute?: () => { getOption?: <T>(k: string) => T } })
      .getRoute?.()?.getOption?.<RouteValidation>('validation')

    if (declared === undefined) { return undefined }
    if (typeof declared !== 'string') { return declared }

    const registry = this.blueprint.get<ValidationConfig>('stone.validation', {}).schemas ?? {}
    const rules = registry[declared]

    if (rules === undefined) {
      throw new TypeError(
        `The route declares \`validation: '${declared}'\`, but no rule set is registered under that ` +
        'name. Register it with `blueprint.set(\'stone.validation.schemas\', { ' + declared + ': { … } })`, ' +
        'or declare the rules inline on the route.'
      )
    }

    return rules
  }
}

/**
 * Meta middleware for route-declared validation.
 *
 * Registered on `stone.router.middleware` by {@link validationBlueprint}, so it runs for every
 * matched route and does nothing on the routes that declare no validation.
 */
export const MetaValidateRouteMiddleware: MetaMiddleware<any, any> = {
  module: ValidateRouteMiddleware,
  isClass: true,
  priority: 5
}
