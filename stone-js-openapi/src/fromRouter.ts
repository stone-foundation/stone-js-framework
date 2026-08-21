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
 * Name a declaration in a way a person can act on.
 *
 * A route names a resource with a string, and a diagnostic that prints `[object Object]` for anything
 * else tells the reader nothing about which endpoint to go and look at.
 *
 * @param declared - What the route declared.
 * @returns Something readable.
 */
function nameOf (declared: unknown): string {
  if (typeof declared === 'string') { return declared }
  if (typeof declared === 'function') { return declared.name }
  return typeof declared
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
      reason: `no resource is registered as '${nameOf(declared)}', so its response is undocumented`
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
function responsesFrom (read: { schema: unknown }, status: number): Record<string | number, any> {
  return { [status]: { description: 'The resource, as published by its schema.', schema: read.schema } }
}

/**
 * The status a successful answer carries.
 *
 * Read, not assumed. A handler that answers `201` said so once, in the decorator that builds its
 * response, and a document that publishes `200` for it contradicts the code it was derived from:
 * a generated client waits for the wrong status, and a test written from the contract fails against
 * a correct application. The route may also state it outright, which wins, because an author who
 * wrote a status meant that status.
 *
 * @param route - The route.
 * @returns The success status.
 */
function successStatus (route: RouteLike): number {
  const onRoute = route.getOption<number>('statusCode')
  if (typeof onRoute === 'number') { return onRoute }

  const declared = declaredOn(route, 'status')
  return typeof declared === 'number' ? declared : 200
}

/**
 * The derived responses, minus the success the author restated.
 *
 * @param derived - What the route said about itself.
 * @param explicit - What the author wrote.
 * @returns The derived responses to keep.
 */
function successOf (derived: OpenApiOperation, explicit: OpenApiOperation): Record<string | number, any> {
  const explicitCodes = Object.keys(explicit.responses ?? {})
  const annotated = explicitCodes.some((code) => code.startsWith('2') && derived.responses?.[code] !== undefined)
  const restated = explicitCodes.some((code) => code.startsWith('2')) && !annotated

  // Annotating the derived success keeps its schema: the two entries are merged in `mergeOperations`,
  // where the author's own fields win.
  if (!restated) { return derived.responses ?? {} }

  // Restating a *different* success is a replacement: an operation answering both 200 and 204
  // describes an endpoint that cannot exist.
  return Object.fromEntries(
    Object.entries(derived.responses ?? {}).filter(([code]) => !code.startsWith('2'))
  )
}

/**
 * Merge what an author wrote over what was derived, without erasing the rest.
 *
 * `explicit` used to be spread over the whole operation, so documenting one `404` deleted the
 * derived success response, and adding one parameter deleted the fragment selector. Nobody writing a
 * 404 means "and forget everything you knew". Statuses merge per code, parameters accumulate, and
 * anything stated at the same place still wins, because the point of writing it was to override.
 *
 * One exception, and it is the reason this is not a plain merge: an author who states a success status
 * the derivation did not produce is restating the success, not adding a second one. An operation
 * answering both `200` and `204` describes an endpoint that cannot exist, so the derived success gives
 * way to the declared one.
 *
 * Stating the *same* status is the opposite: it is a description of the response that was derived, and
 * the schema stays. Getting that backwards emptied the payload of every endpoint whose author had
 * written `200: { description: '…' }`, which is to say every endpoint anyone had documented carefully.
 *
 * @param derived - What the route said about itself.
 * @param explicit - What the author wrote.
 * @returns The operation.
 */
function mergeOperations (derived: OpenApiOperation, explicit: OpenApiOperation): OpenApiOperation {
  const kept = successOf(derived, explicit)
  // Per status, and per field inside a status: writing `200: { description }` is describing the
  // response that was derived, not replacing it. It used to replace it, which emptied the payload of
  // every endpoint whose author had taken the trouble to describe it.
  const responses = Object.fromEntries(
    [...new Set([...Object.keys(kept), ...Object.keys(explicit.responses ?? {})])]
      .map((code) => [code, { ...kept[code], ...explicit.responses?.[code] }])
  )
  const parameters = [...(derived.parameters ?? []), ...(explicit.parameters ?? [])]
  const deduped = parameters.filter(
    (parameter, index) => parameters.findIndex((other) => sameParameter(other, parameter)) === index
  )

  return {
    ...derived,
    ...explicit,
    ...(Object.keys(responses).length > 0 ? { responses } : {}),
    ...(deduped.length > 0 ? { parameters: deduped } : {})
  }
}

/**
 * Whether two parameters describe the same thing: a name in a place.
 *
 * @param left - One parameter.
 * @param right - The other.
 * @returns True when they are the same parameter.
 */
function sameParameter (left: Record<string, unknown>, right: Record<string, unknown>): boolean {
  return left.name === right.name && left.in === right.in
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
export function operationFromRoute (
  route: RouteLike,
  registries: DerivationRegistries = {},
  pathParameters: Array<Record<string, unknown>> = []
): OpenApiOperation {
  const explicit = route.getOption<OpenApiOperation>(CONTRACT_OPTION) ?? {}
  const request = readValidation(declaredOn(route, 'validation'), registries)
  const response = readResource(declaredOn(route, 'resource'), registries, `${route.method} ${String(route.getOption('path') ?? route.path)}`)
  const protectedBy = declaredOn(route, 'auth') ?? declaredOn(route, 'authz')
  const scheme = registries.securityScheme ?? 'bearerAuth'
  const fragments = response?.fragments === undefined
    ? []
    : fragmentParameter(response.fragments, registries.fragmentParam ?? 'view')

  const derived: OpenApiOperation = {
    operationId: route.getOption<string>('name'),
    ...(request !== undefined ? { request } : {}),
    ...(response !== undefined ? { responses: responsesFrom(response, successStatus(route)) } : {}),
    ...(pathParameters.length + fragments.length > 0 ? { parameters: [...pathParameters, ...fragments] } : {}),
    ...(protectedBy !== undefined ? { security: [{ [scheme]: [] }] } : {})
  }

  return mergeOperations(derived, explicit)
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
    .flatMap((route) => {
      const template = templateOf(route)
      const operation = operationFromRoute(route, registries, template.parameters)
      return template.paths.map((path) => ({ path, method: route.method, openapi: operation }))
    })
}

/**
 * The path a route was declared with, in the syntax a contract speaks.
 *
 * A route's `path` is the pathname of the event it is answering, so with no event bound it is `/`:
 * every documented endpoint collapsed onto the root and the document described one nameless
 * operation instead of an API. The declared template is what a route is; the event is what it met.
 *
 * The template is then translated, because the two syntaxes are not the same one. A `:id` segment
 * means nothing to a specification reader, and a path parameter that appears in a template must also
 * be declared, or the document is invalid however right the path looks. An optional segment yields
 * the path with and without it, since OpenAPI has no optional path parameter and would rather have
 * two honest paths than one that lies about being required.
 *
 * @param route - The route.
 * @returns The path(s) to document, and the parameters the template requires.
 */
export function templateOf (route: RouteLike): { paths: string[], parameters: Array<Record<string, unknown>> } {
  const declared = route.getOption<string>('path') ?? route.path
  const segments = declared.split('/').filter((segment) => segment.trim().length > 0)
  const parameters: Array<Record<string, unknown>> = []
  const kept: string[] = []
  const required: string[] = []

  for (const segment of segments) {
    const param = paramOf(segment)

    if (param === undefined) { kept.push(segment); required.push(segment); continue }

    kept.push(`{${param.name}}`)
    if (!param.optional) { required.push(`{${param.name}}`) }
    parameters.push({
      name: param.name,
      in: 'path',
      required: true,
      schema: { type: 'string' }
    })
  }

  const full = `/${kept.join('/')}`
  const shortest = `/${required.join('/')}`

  return { paths: full === shortest ? [full] : [full, shortest], parameters }
}

/**
 * Read one segment of a declared path.
 *
 * The router's own syntax, and only the part a contract cares about: the name, and whether the
 * segment can be left out. A rule (`:id(\\d+)`), a quantifier or a prefix changes what matches, not
 * what the parameter is called.
 *
 * @param segment - One path segment.
 * @returns The parameter it declares, or nothing when it is a literal.
 */
function paramOf (segment: string): { name: string, optional: boolean } | undefined {
  const alreadyBraced = /^\{(\w+)\}\??$/.exec(segment)
  if (alreadyBraced !== null) { return { name: alreadyBraced[1], optional: segment.endsWith('?') } }

  const declared = /:(\w+)/.exec(segment)
  if (declared === null) { return undefined }

  return { name: declared[1], optional: /[?*]$/.test(segment) }
}
