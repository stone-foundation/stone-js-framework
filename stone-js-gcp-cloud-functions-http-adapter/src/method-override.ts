import { IBlueprint } from '@stone-js/core'
import { IncomingMessage } from 'node:http'

/**
 * The only methods a request is allowed to be overridden TO. Overriding to GET/HEAD/etc. is never
 * permitted (it would let a form bypass safe-method assumptions).
 */
const OVERRIDABLE_METHODS = new Set(['PUT', 'PATCH', 'DELETE'])

/**
 * Resolve a safe HTTP method override for fullstack forms.
 *
 * HTML forms can only send GET/POST, so frameworks let a POST declare its "real" method via a
 * hidden `$method$` field or the standard `X-HTTP-Method-Override` header. Accepting that override
 * UNCONDITIONALLY (as the code used to) is a security hole: any request could turn itself into a
 * DELETE and bypass method-based access/CSRF checks.
 *
 * This gates the override so it is only honoured when ALL hold:
 * - it is explicitly enabled (`stone.http.allowMethodOverride`, default true), and
 * - the ORIGINAL method is `POST` (never upgrade a GET), and
 * - the target is a safe, whitelisted method (`PUT`/`PATCH`/`DELETE`).
 *
 * The standard `X-HTTP-Method-Override` header takes precedence over the `$method$` body field.
 *
 * @param blueprint - The application blueprint.
 * @param rawEvent - The incoming Node request.
 * @param bodyOverride - The `$method$` value extracted from the parsed body/form (if any).
 * @returns The overridden method (upper-case), or undefined to keep the original method.
 */
export function resolveMethodOverride (
  blueprint: IBlueprint,
  rawEvent: IncomingMessage,
  bodyOverride?: unknown
): string | undefined {
  if (!blueprint.get<boolean>('stone.http.allowMethodOverride', true)) { return undefined }
  if (String(rawEvent.method ?? '').toUpperCase() !== 'POST') { return undefined }

  const headerOverride = rawEvent.headers['x-http-method-override']
  const candidate = String(
    (Array.isArray(headerOverride) ? headerOverride[0] : headerOverride) ??
    bodyOverride ??
    ''
  ).toUpperCase()

  return OVERRIDABLE_METHODS.has(candidate) ? candidate : undefined
}
