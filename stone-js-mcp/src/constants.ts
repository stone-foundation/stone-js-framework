/** The JSON-RPC version every MCP message carries. */
export const JSONRPC_VERSION: string = '2.0'

/**
 * The protocol revisions this server answers to, newest first.
 *
 * A client states the revision it wants during `initialize`. A server that supports it answers with
 * the same one; otherwise it answers with its own latest and lets the client decide whether to
 * continue. Keeping the list explicit is what makes that negotiation honest.
 */
export const SUPPORTED_PROTOCOL_VERSIONS: readonly string[] = [
  '2025-11-25',
  '2025-06-18',
  '2025-03-26',
  '2024-11-05'
] as const

/** The newest revision this server speaks. */
export const LATEST_PROTOCOL_VERSION: string = SUPPORTED_PROTOCOL_VERSIONS[0]

/** Where the endpoint is served unless the application says otherwise. */
export const DEFAULT_MCP_PATH: string = '/mcp'

/** The name of the route this module registers, so an application can refer to it. */
export const MCP_ROUTE_NAME: string = 'mcp'

/**
 * The metadata keys the first-party modules record their route-level declarations under.
 *
 * Read as strings, never imported, the same convention `@stone-js/openapi` follows: this module
 * derives tools from what an application declares, and must not depend on the modules that declare
 * it. An application using none of them still exposes tools; one using all of them exposes better
 * ones.
 */
export const DECLARATION_KEYS: Record<'validation' | 'resource' | 'auth' | 'authz', string> = {
  validation: '@stone-js/validation/validate',
  resource: '@stone-js/resources/returns',
  auth: '@stone-js/auth/protect',
  authz: '@stone-js/authz/can'
}
