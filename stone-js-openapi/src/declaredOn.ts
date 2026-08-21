import { getMetadata, hasMetadata } from '@stone-js/core'

/**
 * The metadata keys the first-party modules record their route-level declarations under.
 *
 * Read as strings, never imported: this package derives a contract from what an application declares,
 * and it must not depend on the modules that declare it. An application using none of them documents
 * itself just as well, and a module added tomorrow needs a key here, not a dependency.
 */
export const DECLARATION_KEYS = {
  validation: '@stone-js/validation/validate',
  resource: '@stone-js/resources/returns',
  auth: '@stone-js/auth/protect',
  authz: '@stone-js/authz/can',
  status: '@stone-js/http-core/response'
} as const

/** The concerns a route may declare, on itself or on its handler. */
export type Concern = keyof typeof DECLARATION_KEYS

/** The property each decorator stores its value under, inside its metadata entry. */
const VALUE_PROPERTY: Record<Concern, string> = {
  validation: 'validation',
  resource: 'resource',
  auth: 'auth',
  authz: 'authz',
  status: 'statusCode'
}

/** A route, reduced to what reading a declaration needs. */
export interface DeclaringRoute {
  getOption: <T>(key: string) => T | undefined
}

/**
 * What a route declares for one concern, wherever it was written.
 *
 * The route's own option comes first, because when a router is in play a route is the single
 * description of itself. Failing that, the handler's own decorator is read — `@Validate`, `@Returns`,
 * `@Protect`, `@Can` — which is the form that needs no router at all.
 *
 * That second half is the reason this exists. Both modules advertise working without a router, and a
 * contract that only ever read route options quietly documented half of such an application: the
 * endpoints were listed, their payloads were not.
 *
 * @param route - The route.
 * @param concern - What to look for.
 * @returns What was declared, or `undefined`.
 */
export function declaredOn (route: DeclaringRoute, concern: Concern): unknown {
  // The status is the one concern a route never spells with the concern's own name: it is an HTTP
  // detail, and `statusCode` is what a route definition already calls it.
  const onRoute = route.getOption(concern === 'status' ? 'statusCode' : concern)
  if (onRoute !== undefined) { return onRoute }

  const handler = route.getOption<{ module?: any, action?: string | symbol }>('handler')

  return fromHandler(handler, concern)
}

/**
 * What a handler's decorator recorded for one concern.
 *
 * @param handler - The handler the route resolves to.
 * @param concern - What to look for.
 * @returns What was declared, or `undefined`.
 */
export function fromHandler (
  handler: { module?: any, action?: string | symbol } | undefined,
  concern: Concern
): unknown {
  const module = handler?.module
  const key = DECLARATION_KEYS[concern]

  if (module === undefined || !hasMetadata(module, key)) { return undefined }

  const declarations = getMetadata<any, Array<Record<string, unknown>>>(module, key, [])
  const action = handler?.action

  // A single-handler module declares one; a controller declares one per method.
  const entry = action === undefined
    ? declarations[0]
    : declarations.find((declaration) => declaration.action === action)

  return entry?.[VALUE_PROPERTY[concern]]
}
