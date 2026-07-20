import { AdapterContext, IncomingEvent, IncomingEventOptions, OutgoingResponse, Promiseable } from '@stone-js/core'

/** Platform identifier for the MCP adapter. */
export const MCP_PLATFORM = 'mcp'

/** A Zod raw shape (`{ field: zodType }`) describing a tool's arguments. */
export type ZodRawShape = Record<string, unknown>

/**
 * A tool handler: receives the validated arguments (and the underlying event) and returns a
 * result. The result is serialised into MCP tool content.
 */
export type McpToolHandler = (args: Record<string, unknown>, event: IncomingEvent) => Promiseable<unknown>

/**
 * A tool exposed to AI agents over MCP.
 */
export interface McpTool {
  /** Unique tool name (what the agent calls). */
  name: string
  /** Human/agent-readable description. */
  description?: string
  /** Zod raw shape validating the arguments (MCP validates against it before your handler runs). */
  inputSchema?: ZodRawShape
  /** The domain logic to run — the same code you'd call from an HTTP handler. */
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
