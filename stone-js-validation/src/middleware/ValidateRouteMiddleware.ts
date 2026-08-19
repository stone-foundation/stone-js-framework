import { Validator } from '../Validator'
import { ValidationRules } from '../validateEvent'
import { VALIDATE_KEY } from '../decorators/constants'
import { ValidationIssue } from '../declarations'
import { ValidationError } from '../errors/ValidationError'
import { ValidateMetadata } from '../decorators/Validate'
import { ValidationConfig } from '../options/ValidationBlueprint'
import { metadataKeyFor, readSource, RouteValidationInput } from '../sources'
import { isValidationSchemaClass, rulesOf } from '../schemaClass'
import {
  IBlueprint, IContainer, IncomingEvent, NextMiddleware, OutgoingResponse,
  ClassType, getMetadata, hasMetadata, type MetaMiddleware
} from '@stone-js/core'

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
  private readonly container?: IContainer
  private readonly validator: Validator

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ blueprint, container }: { blueprint: IBlueprint, container?: IContainer }) {
    this.blueprint = blueprint
    this.container = container
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
    const declared = this.declarationFor(event)

    if (declared === undefined) { return undefined }
    if (typeof declared !== 'string') { return rulesOf(declared) }

    const registry = this.blueprint.get<ValidationConfig>('stone.validation', {}).schemas ?? {}
    const named = registry[declared]

    if (named === undefined) {
      throw new TypeError(
        `The route declares \`validation: '${declared}'\`, but no rule set is registered under that ` +
        'name. Register it with `blueprint.set(\'stone.validation.schemas\', { ' + declared + ': { … } })`, ' +
        'or declare the rules inline on the route.'
      )
    }

    return rulesOf(this.resolve(named))
  }

  /**
   * What the handler about to run declared, from either of the two places it may live.
   *
   * The route's own option comes first, because when a router is in play a route is the single
   * description of itself and that is where a reader looks. Failing that, the handler's own
   * `@Validate` metadata is read: that form owns its key and needs no router at all, so the same
   * module validates a routed request, a single-handler service, a CLI command or a browser event.
   *
   * @param event - The incoming event.
   * @returns What was declared, or `undefined`.
   */
  private declarationFor (event: IncomingEvent): RouteValidation | undefined {
    // Duck-typed throughout: the kernel is agnostic, and an event without a router carries no route.
    const route = (event as unknown as {
      getRoute?: () => { getOption?: <T>(k: string) => T } | undefined
    }).getRoute?.()

    const onRoute = route?.getOption?.<RouteValidation>('validation')
    if (onRoute !== undefined) { return onRoute }

    const handler = route?.getOption?.<{ module?: ClassType, action?: string | symbol }>('handler') ??
      this.blueprint.get<{ module?: ClassType, action?: string | symbol }>('stone.kernel.eventHandler', {})

    return this.declaredOnHandler(handler)
  }

  /**
   * What a handler declared with `@Validate`, if anything.
   *
   * @param handler - The handler about to run.
   * @returns What the matching method declared, or `undefined`.
   */
  private declaredOnHandler (
    handler?: { module?: ClassType, action?: string | symbol }
  ): RouteValidation | undefined {
    const module = handler?.module
    if (module === undefined || !hasMetadata(module, VALIDATE_KEY)) { return undefined }

    const declarations = getMetadata<ClassType, ValidateMetadata[]>(module, VALIDATE_KEY, [])
    const action = handler?.action

    // A single-handler module declares one; a controller declares one per method.
    return (
      action === undefined
        ? declarations[0]
        : declarations.find((declaration) => declaration.action === action)
    )?.validation
  }

  /**
   * Resolve a registered entry: a schema class goes through the container, so its constructor gets
   * the services it asked for and `rules()` can use them, i18n included.
   *
   * @param entry - What the registry holds.
   * @returns Something `rulesOf` can read.
   */
  private resolve (entry: unknown): any {
    if (!isValidationSchemaClass(entry)) { return entry }
    return this.container?.resolve?.(entry as any, true) ?? new (entry as any)({})
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
