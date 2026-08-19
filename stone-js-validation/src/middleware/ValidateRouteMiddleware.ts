import { Validator } from '../Validator'
import { ValidationRules } from '../validateEvent'
import { ValidationConfig } from '../options/ValidationBlueprint'
import { metadataKeyFor, readSource, RouteValidationInput, toValidationRules } from '../sources'
import { IBlueprint, IncomingEvent, NextMiddleware, OutgoingResponse, type MetaMiddleware } from '@stone-js/core'
import { ValidationError } from '../errors/ValidationError'
import { ValidationIssue } from '../declarations'

/**
 * What a route's `validation` option accepts: a schema, a map of schemas keyed by source, or the
 * name of either registered under `stone.validation.schemas`.
 */
export type RouteValidation = RouteValidationInput | string

/**
 * Route middleware: validates what a route declared, before its handler runs.
 *
 * A route says what it accepts, once, where the route is defined:
 *
 * ```ts
 * @Post('/users', { validation: { body: CreateUserSchema } })
 * ```
 *
 * A single schema means the body, which is what almost every route means; a map validates several
 * sources at once (`{ body, query, params }`).
 *
 * This middleware reads that from the matched route and validates it. On success each **parsed**
 * source is published in the event's metadata under a predictable name, so a handler reads
 * `event.get<CreateUser>('validatedBody')` with no helper and no import. That matters more than it
 * looks: a schema coerces and strips, and re-reading the raw value is how an application validates
 * one thing and uses another. On failure it throws a `ValidationError` carrying every issue at once.
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
      event.setMetadataValue(this.validateSources(event, rules))
    }

    return await next(event)
  }

  /**
   * Validate every declared source, and return what to publish on the event.
   *
   * Every source is validated before anything is thrown, so a caller sees the full picture rather
   * than one failure at a time.
   *
   * @param event - The incoming event.
   * @param rules - The rules, keyed by source.
   * @returns The parsed sources, keyed by their metadata name.
   * @throws {ValidationError} When any source fails.
   */
  private validateSources (event: IncomingEvent, rules: ValidationRules): Record<string, unknown> {
    const issues: ValidationIssue[] = []
    const parsed: Record<string, unknown> = {}

    for (const [source, schema] of Object.entries(rules)) {
      const result = this.validator.validate(schema, readSource(event as any, source))
      if (result.success) {
        parsed[metadataKeyFor(source)] = result.value
      } else {
        issues.push(...result.issues.map((issue) => ({ ...issue, path: [source, ...issue.path] })))
      }
    }

    if (issues.length > 0) {
      throw new ValidationError('The given data failed validation.', { issues })
    }

    return parsed
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
    if (typeof declared !== 'string') { return toValidationRules(declared) }

    const registry = this.blueprint.get<ValidationConfig>('stone.validation', {}).schemas ?? {}
    const named = registry[declared]

    if (named === undefined) {
      throw new TypeError(
        `The route declares \`validation: '${declared}'\`, but no rule set is registered under that ` +
        'name. Register it with `blueprint.set(\'stone.validation.schemas\', { ' + declared + ': { … } })`, ' +
        'or declare the rules inline on the route.'
      )
    }

    return toValidationRules(named as RouteValidationInput)
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
