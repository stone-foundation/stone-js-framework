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
}

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
  const explicit = route.getOption<OpenApiOperation>('openapi') ?? {}
  const request = readValidation(route.getOption('validation'), registries)
  const protectedBy = route.getOption('auth') ?? route.getOption('authz')
  const scheme = registries.securityScheme ?? 'bearerAuth'

  return {
    operationId: route.getOption<string>('name'),
    ...(request !== undefined ? { request } : {}),
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
    .filter((route) => route.getOption('openapi') !== false) // an opt-out for internal endpoints
    .map((route) => ({
      path: route.path,
      method: route.method,
      openapi: operationFromRoute(route, registries)
    }))
}
