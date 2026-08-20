import { Concern, declaredOn } from './declaredOn'
import { OpenApiOperation, OpenApiRoute } from './declarations'

/**
 * The shape this module needs from a route. Duck-typed on purpose: `@stone-js/openapi` derives the
 * contract without depending on `@stone-js/router`, exactly as the router carries module props
 * without depending on the modules.
 */
export interface RouteLike {
  path: string
  method: string
  getOption: <T = unknown>(key: string, fallback?: T) => T | undefined
}

/** The shape this module needs from a router. */
export interface RouterLike {
  getRoutes: () => { getRoutes: () => RouteLike[] }
}

/**
 * How to resolve what a route declared, when it named something instead of inlining it.
 */
export interface DerivationRegistries {
  /** `stone.validation.schemas`: alias to rule set, schema class, or schema. */
  schemas?: Record<string, unknown>
  /** The security scheme name to require when a route declares `auth`. */
  securityScheme?: string
  /**
   * How to build a schema class, normally the container.
   *
   * With it, a class whose `rules()` needs a service gets that service, so every declared schema is
   * readable and the contract is complete. Without it, such a class cannot be read and is skipped:
   * a wrong contract is worse than a missing one.
   */
  resolve?: (target: any) => unknown

  /**
   * Told when a declaration could not be read, so an absent payload is visible rather than silent.
   *
   * Omitting a contract we could not build is the right call — a wrong contract is worse than a
   * missing one — but doing it without a word means an endpoint quietly ships undocumented. This is
   * how the CLI and the handler report it.
   */
  onSkipped?: (skipped: { route: string, concern: Concern, reason: string }) => void

  /**
   * The query parameter a caller selects a fragment with, as the application named it.
   *
   * Read from `stone.resources.params.fragment`, so a contract never advertises a parameter the
   * application does not answer to. Defaults to `view`.
   */
  fragmentParam?: string

  /**
   * Named resources, so a route saying `resource: 'user'` can be read.
   *
   * Comes from `stone.resources.registry`, the same registry the runtime projects through, so the
   * documented response and the sent response are derived from one declaration.
   */
  resources?: Record<string, unknown>
}

/**
 * The route option carrying what a route publishes about itself.
 *
 * `contract`, not `openapi`: a route describes itself, and OpenAPI is one way of *rendering* that
 * description. Naming the option after a specification would put that specification's name in the
 * router's vocabulary, and every application would have to rename its routes the day the framework
 * renders the same contract as something else.
 *
 * ```ts
 * @Get('/tasks', { contract: { summary: 'List tasks' } })
 * @Get('/internal', { contract: false })            // documented nowhere
 * ```
 */
export const CONTRACT_OPTION = 'contract'

/** Whether a value exposes `rules()`, i.e. is a schema class instance or a schema class. */
function hasRules (value: any): boolean {
  return typeof value?.rules === 'function' || typeof value?.prototype?.rules === 'function'
}

/**
 * Read a validation declaration into `{ source: schema }`, whatever form it took.
 *
 * A schema class is built through `resolve` when one is given, which is how a class whose `rules()`
 * needs i18n or any other service still contributes its schema. Failing that it is constructed with
 * no dependencies, and if even that throws it is skipped rather than guessed at, because a wrong
 * contract is worse than a missing one.
 *
 * @param declared - What the route declared under `validation`.
 * @param registries - The registry to resolve a name against, and how to build a class.
 * @returns The schemas keyed by source, or `undefined` when nothing could be read.
 */
export function readValidation (
  declared: unknown,
  registries: DerivationRegistries = {}
): Record<string, unknown> | undefined {
  const { schemas = {} } = registries
  const resolved = typeof declared === 'string' ? schemas[declared] : declared

  if (resolved === undefined || resolved === null) { return undefined }

  if (hasRules(resolved)) {
    try {
      const SchemaClass = resolved as any
      const instance = typeof resolved !== 'function'
        ? SchemaClass
        : registries.resolve?.(SchemaClass) ?? new SchemaClass({})
      return readValidation(instance.rules(), registries)
    } catch {
      return undefined // nothing could build it, and inventing a shape is worse than omitting one
    }
  }

  // A single schema means the body, the same rule the validator applies.
  const isSchema = typeof (resolved as any).validate === 'function' ||
    typeof (resolved as any).parse === 'function' ||
    typeof (resolved as any).safeParse === 'function' ||
    (resolved as any)['~standard'] !== undefined

  return isSchema ? { body: resolved } : (resolved as Record<string, unknown>)
}

/** Whether a value exposes `schema()`, i.e. is a resource or a resource class. */
function hasSchema (value: any): boolean {
  return typeof value?.schema === 'function' || typeof value?.prototype?.schema === 'function'
}

/**
 * Read what a route promises to return, from the resource that will shape it.
 *
 * This is the half of a contract that usually has to be written twice: once as the projection the
 * code performs, once as the response the document claims. A resource publishes its schema, the
 * runtime validates against it, and this reads the same declaration — so the document cannot say one
 * thing while the endpoint answers another.
 *
 * Fragments come with it. A resource exposing `summary` is exposing a second documented shape, not a
 * private convenience, so the contract names it too.
 *
 * @param declared - What the route declared under `resource`.
 * @param registries - The registry to resolve a name against, and how to build a class.
 * @returns The response schema and its fragments, or `undefined` when nothing could be read.
 */
export function readResource (
  declared: unknown,
  registries: DerivationRegistries = {},
  route: string = '(unknown route)'
): { schema: unknown, fragments?: Record<string, unknown> } | undefined {
  const { resources = {} } = registries

  if (declared === undefined || declared === null) { return undefined }

  const resolved = typeof declared === 'string' ? resources[declared] : declared

  if (resolved === undefined) {
    registries.onSkipped?.({
      route,
      concern: 'resource',
      reason: `no resource is registered as '${String(declared)}', so its response is undocumented`
    })
    return undefined
  }

  if (!hasSchema(resolved)) {
    registries.onSkipped?.({
      route,
      concern: 'resource',
      reason: 'the declared resource publishes no schema() to derive a response from'
    })
    return undefined
  }

  try {
    const ResourceClass = resolved as any
    const instance = typeof resolved !== 'function'
      ? ResourceClass
      : registries.resolve?.(ResourceClass) ?? new ResourceClass({})

    const schema = instance.schema({})

    if (schema === undefined || schema === null) {
      registries.onSkipped?.({ route, concern: 'resource', reason: 'schema() returned nothing' })
      return undefined
    }

    const fragments = typeof instance.fragments === 'function' ? instance.fragments({}) : undefined

    return fragments === undefined ? { schema } : { schema, fragments }
  } catch (error: any) {
    // Nothing could build it, and inventing a response shape is worse than omitting one — but saying
    // so is better than both. A schema needing a real context is the common cause: it is read with an
    // empty one, because a contract describes what any caller may see.
    registries.onSkipped?.({
      route,
      concern: 'resource',
      reason: `its schema could not be read (${String(error?.message ?? error)})`
    })
    return undefined
  }
}

/**
 * Turn what a resource publishes into the operation's responses.
 *
 * The full contract is the success response. Fragments are not separate status codes — they are
 * alternate shapes of the same answer, chosen by the caller — so they are documented as the parameter
 * that selects them rather than as different outcomes.
 *
 * @param read - The schema and fragments read from the resource.
 * @returns The responses, keyed by status.
 */
function responsesFrom (read: { schema: unknown }): Record<string | number, any> {
  return { 200: { description: 'The resource, as published by its schema.', schema: read.schema } }
}

/**
 * Document the fragments a resource exposes as what they are: a closed set of names a caller may ask
 * for.
 *
 * Naming them in prose left them invisible to everything that reads a contract rather than a page — a
 * generated client, a form, a test. An enumerated parameter is what a specification can carry, so a
 * caller discovers `?view=summary` from the document instead of from a sentence.
 *
 * @param fragments - The fragments the resource published.
 * @param name - The parameter the application answers to.
 * @returns The parameter, or nothing when there is nothing to select.
 */
function fragmentParameter (fragments: Record<string, unknown> | undefined, name: string): Array<Record<string, unknown>> {
  const names = Object.keys(fragments ?? {})

  if (names.length === 0) { return [] }

  return [{
    name,
    in: 'query',
    required: false,
    description: 'Select a named subset of the response. Omit it for the full contract.',
    schema: { type: 'string', enum: names }
  }]
}

/**
 * Derive one operation from what a route declares.
 *
 * Everything a route says about itself contributes: its validation becomes the request, its `auth`
 * or `authz` becomes a security requirement, and anything declared explicitly under `openapi` wins,
 * because an author who wrote it meant it.
 *
 * @param route - The route.
 * @param registries - How to resolve names.
 * @returns The operation.
 */
export function operationFromRoute (route: RouteLike, registries: DerivationRegistries = {}): OpenApiOperation {
  const explicit = route.getOption<OpenApiOperation>(CONTRACT_OPTION) ?? {}
  const request = readValidation(declaredOn(route, 'validation'), registries)
  const response = readResource(declaredOn(route, 'resource'), registries, `${route.method} ${route.path}`)
  const protectedBy = declaredOn(route, 'auth') ?? declaredOn(route, 'authz')
  const scheme = registries.securityScheme ?? 'bearerAuth'

  return {
    operationId: route.getOption<string>('name'),
    ...(request !== undefined ? { request } : {}),
    ...(response !== undefined ? { responses: responsesFrom(response) } : {}),
    ...(response?.fragments !== undefined
      ? { parameters: fragmentParameter(response.fragments, registries.fragmentParam ?? 'view') }
      : {}),
    ...(protectedBy !== undefined ? { security: [{ [scheme]: [] }] } : {}),
    ...explicit
  }
}

/**
 * Derive every documented route from a router.
 *
 * This is what makes the contract free: a route already declares its path, its method, what it
 * accepts and whether it is protected, so the document is a view of the routing table rather than a
 * second description of it. Nothing has to be restated, and nothing can drift.
 *
 * @param router - The router.
 * @param registries - How to resolve names.
 * @returns The routes, ready for `addRoutes`.
 */
export function routesFromRouter (router: RouterLike, registries: DerivationRegistries = {}): OpenApiRoute[] {
  return router
    .getRoutes()
    .getRoutes()
    .filter((route) => route.getOption(CONTRACT_OPTION) !== false) // an opt-out for internal endpoints
    .map((route) => ({
      path: route.path,
      method: route.method,
      openapi: operationFromRoute(route, registries)
    }))
}
