/** A JSON Schema, as MCP carries it. Kept open on purpose: it is data, not a type to satisfy. */
export type JsonSchema = Record<string, unknown>

/**
 * What a route declares to become a tool.
 *
 * The short form names the tool and nothing else, which is enough when the route already documents
 * itself through `openapi`, `@Validate` or `@Returns`:
 *
 * ```ts
 * @Post('/notes', { mcp: 'create-note' })
 * ```
 *
 * The long form states what the short form would have to derive:
 *
 * ```ts
 * @Post('/notes', { mcp: { name: 'create-note', description: 'Create a note for the signed-in user.' } })
 * ```
 */
export type McpInput = string | McpToolDeclaration

/** The long form of a tool declaration. */
export interface McpToolDeclaration {
  /** The name an agent calls. Defaults to the route's name. */
  name?: string
  /**
   * What the tool does, in the words a model reads before deciding to call it.
   *
   * Derived from the route's `openapi` summary or description when it is not stated here. A tool
   * with neither is still exposed, and says so in the log: an agent given a bare name will guess,
   * and guessing against a route that writes something is the failure worth seeing early.
   */
  description?: string
  /**
   * The arguments the tool takes, as JSON Schema.
   *
   * Derived from the route's validation schema when it is not stated here, and from the route's
   * path parameters when there is no schema to read. State it to override both.
   */
  inputSchema?: JsonSchema
  /**
   * The shape of the result, as JSON Schema.
   *
   * When declared, a successful call also answers `structuredContent`, so an agent reads a value
   * rather than parsing prose. Undeclared, the result travels as text only, which is what the
   * protocol asks for when a shape was never promised.
   */
  outputSchema?: JsonSchema
  /**
   * Hints an agent may use to decide how carefully to call this tool: `readOnlyHint`,
   * `destructiveHint`, `idempotentHint`, `openWorldHint`, `title`.
   *
   * They are hints, never a guarantee, and never a substitute for the authorization on the route.
   */
  annotations?: Record<string, unknown>
}

/** One tool, as `tools/list` answers it. */
export interface McpTool {
  name: string
  description?: string
  inputSchema: JsonSchema
  outputSchema?: JsonSchema
  annotations?: Record<string, unknown>
}

/** A tool and the route that answers it. */
export interface McpToolRoute {
  tool: McpTool
  route: RouteLike
}

/**
 * The shape this module needs from a route.
 *
 * Duck-typed on purpose: this package derives tools from the router without depending on it, exactly
 * as the router carries module props without depending on the modules.
 */
export interface RouteLike {
  /**
   * What the route declared, read through its options.
   *
   * `path` and `method` are read from here rather than from properties of the same name: on a live
   * route, `path` is the request's path once bound, and the declared template lives only in the
   * options. Reading the property gave `/` for every route, which is a tool that takes no arguments
   * and calls the wrong endpoint.
   */
  getOption: <T = unknown>(key: string, fallback?: T) => T | undefined
}

/** The shape this module needs from a router. */
export interface RouterLike {
  getRoutes: () => { getRoutes: () => RouteLike[] }
  dispatch: (event: unknown) => Promise<unknown>
}

/**
 * How the MCP endpoint is configured (`stone.mcp.*`).
 *
 * Nothing here decides what an agent may do. That is settled by the route a tool leads to: a tool
 * call is dispatched as a real request, so authentication, authorization, validation and the rate
 * limit are the ones the route already declares. A module that carried its own permission model
 * would be a second set of rules to keep in step with the first.
 */
export interface McpConfig {
  /** Where the endpoint is served. Defaults to `/mcp`. */
  path?: string
  /** The server name an agent sees during `initialize`. Defaults to the application's name. */
  name?: string
  /** The server version an agent sees. Defaults to `0.0.0`. */
  version?: string
  /**
   * Instructions handed to the agent once, alongside the tool list.
   *
   * The place to say what this API is for and how its tools relate, which no single tool
   * description can carry.
   */
  instructions?: string
  /**
   * Whether a tool with no description is refused rather than exposed.
   *
   * `false` by default, because a route that says `mcp: 'create-note'` asked for a tool and should
   * get one. Set it to `true` on an API where an undescribed tool is a defect: an agent reading a
   * bare name will guess, and it guesses worst on the routes that write.
   */
  requireDescription?: boolean
  /**
   * Anything else to put on the endpoint's route definition: `auth`, `authz`, `rateLimit`,
   * `middleware`, a different `name`.
   *
   * This is how the endpoint is protected, and it is protected like any other route rather than by
   * options this module invents. A public tool surface is a decision, so it is written here.
   *
   * ```ts
   * blueprint.set('stone.mcp.route', { auth: true, rateLimit: { max: 60, window: 60, by: 'user' } })
   * ```
   */
  route?: Record<string, unknown>
  /**
   * The last word on which tools are exposed, called once per listing.
   *
   * Everything else about a tool is declared on its route. This exists for what a declaration
   * cannot know: an environment, a flag, a caller. Return `false` to leave a tool out.
   */
  filter?: (tool: McpTool, route: RouteLike) => boolean
}
