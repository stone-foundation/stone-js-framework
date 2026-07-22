import { AdapterContext, IncomingEvent, IncomingEventOptions, OutgoingResponse, Promiseable } from '@stone-js/core'

/** Platform identifier for the MCP adapter. */
export const MCP_PLATFORM = 'mcp'

/**
 * Default `instructions` advertised to the MCP client (the LLM/agent). It states the Continuum
 * contract so the agent knows what it is looking at: the tools ARE the developer's domain, Stone.js
 * supplies the context, and a tool call is resolved by the same kernel as an HTTP request. When the
 * app also exposes the `@stone-js/mcp` framework tools (`stone_*`), the agent is told to use them to
 * understand the framework itself.
 */
export const DEFAULT_MCP_INSTRUCTIONS: string = [
  'This MCP server exposes a Stone.js application as callable tools.',
  'In the Continuum model the developer owns the domain (these tools) and Stone.js supplies the context:',
  'a tool call is resolved by the same kernel (middleware, DI, validation, hooks) as an HTTP request,',
  'so a tool behaves exactly like the matching REST endpoint. Prefer calling these tools over guessing',
  'the application\'s shape. If tools named `stone_*` are present, they answer questions about the',
  'Stone.js framework itself (concepts, modules, conventions, gaps); use them to understand how this',
  'application is built before changing it.'
].join(' ')

/** A Zod raw shape (`{ field: zodType }`) describing a tool's arguments. */
export type ZodRawShape = Record<string, unknown>

/**
 * A tool handler: receives the validated arguments (and the underlying event) and returns a
 * result. The result is serialised into MCP tool content.
 */
export type McpToolHandler = (args: Record<string, unknown>, event: IncomingEvent) => Promiseable<unknown>

/**
 * A tool exposed to AI agents over MCP.
 *
 * This is a TOOLS adapter, not an HTTP-domain adapter: a tool is an explicitly declared operation,
 * not an auto-derived route. Its `handler` is registered as a key-route (`name` -> `handler`) and
 * is invoked BY THE KERNEL's key-router (`@KeyRouting()`), so a tool call flows through the same
 * middleware/DI/hooks as any other Stone.js event. The adapter itself performs no dispatch.
 */
export interface McpTool {
  /** Unique tool name (what the agent calls); also the routing key. */
  name: string
  /** Human/agent-readable description. */
  description?: string
  /** Zod raw shape validating the arguments (MCP validates against it before the handler runs). */
  inputSchema?: ZodRawShape
  /** The domain logic to run, invoked by the key-router with `(args, event)`. */
  handler: McpToolHandler
}

/**
 * MCP configuration (`stone.mcp.*`).
 */
export interface McpOptions {
  /** Server name advertised to clients (default `stone-app`). */
  name?: string
  /** Server version advertised to clients (default `0.0.0`). */
  version?: string
  /**
   * Instructions advertised to the client (the LLM/agent) describing how to use the server.
   * Defaults to {@link DEFAULT_MCP_INSTRUCTIONS}; pass an empty string to advertise none.
   */
  instructions?: string
  /** The tools to expose. */
  tools?: McpTool[]
}

/** The (empty) execution context for the MCP adapter. */
export type McpExecutionContext = Record<string, unknown>

/** The adapter context for the MCP adapter. */
export type McpAdapterContext = AdapterContext<
IncomingEvent,
OutgoingResponse,
McpExecutionContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
>
