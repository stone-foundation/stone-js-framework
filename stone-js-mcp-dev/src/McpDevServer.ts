import { stoneMcpTools, createReportTools } from './tools'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpDevLogger, McpDevOptions, McpToolDef } from './declarations'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { DEFAULT_MCP_INSTRUCTIONS, DEFAULT_MCP_SERVER_NAME, DEFAULT_MCP_SERVER_VERSION } from './constants'

/**
 * An MCP tool result payload (the SDK content shape).
 */
export interface McpToolResult {
  content: Array<{ type: 'text', text: string }>
  isError?: boolean
}

/**
 * Wrap any handler return value as MCP text content (JSON for structured data).
 *
 * @param result - The value a tool handler returned.
 * @returns The MCP content payload.
 */
export function toToolContent (result: unknown): McpToolResult {
  const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
  return { content: [{ type: 'text', text }] }
}

/**
 * Create the activity logger. It writes to **stderr** (never stdout, which the stdio transport
 * reserves for the JSON-RPC protocol); a no-op when `quiet` is set.
 *
 * @param quiet - Silence the log.
 * @returns The logger.
 */
export function createStderrLogger (quiet: boolean = false): McpDevLogger {
  return (message: string): void => {
    if (!quiet) { process.stderr.write(`${message}\n`) }
  }
}

/**
 * Resolve the full tool list: the built-in framework-knowledge tools, the optional GitHub report
 * tools, then the app's own tools.
 *
 * @param options - The dev-server options.
 * @returns The merged tool list.
 */
export function resolveTools (options: McpDevOptions): McpToolDef[] {
  return [
    ...stoneMcpTools,
    ...(options.report !== undefined ? createReportTools(options.report) : []),
    ...(options.tools ?? [])
  ]
}

/**
 * Build the SDK callback for one tool: log the call to stderr, run the handler, log the outcome,
 * and wrap the result (or the error) as MCP content.
 *
 * @param tool - The tool definition.
 * @param log - The activity logger.
 * @returns The SDK tool callback.
 */
export function createToolCallback (
  tool: McpToolDef,
  log: McpDevLogger
): (args: Record<string, unknown>) => Promise<McpToolResult> {
  return async (args: Record<string, unknown>): Promise<McpToolResult> => {
    const input = args ?? {}
    log(`→ ${tool.name}(${JSON.stringify(input)})`)
    try {
      const result = await tool.handler(input)
      log(`← ${tool.name} ok`)
      return toToolContent(result)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      log(`← ${tool.name} error: ${message}`)
      return { ...toToolContent({ error: message }), isError: true }
    }
  }
}

/**
 * Build a fully-configured MCP server: advertise the instructions and register every resolved tool
 * with its logging callback. The handlers run in-process (dev/knowledge helpers, not the domain).
 *
 * @param options - The dev-server options.
 * @param log - The activity logger.
 * @returns The configured MCP server.
 */
export function buildMcpServer (options: McpDevOptions, log: McpDevLogger): McpServer {
  const server = new McpServer(
    { name: options.name ?? DEFAULT_MCP_SERVER_NAME, version: options.version ?? DEFAULT_MCP_SERVER_VERSION },
    { instructions: options.instructions ?? DEFAULT_MCP_INSTRUCTIONS }
  )

  for (const tool of resolveTools(options)) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: (tool.inputSchema ?? {}) as never },
      createToolCallback(tool, log) as never
    )
  }

  return server
}

/**
 * Start the MCP dev server over stdio and keep it alive until the process is interrupted.
 *
 * The stdio transport speaks JSON-RPC on stdout and keeps the event loop alive by reading stdin,
 * so `Ctrl+C` (SIGINT) stops it, exactly like `stone dev`.
 *
 * @param options - The dev-server options.
 */
/* v8 ignore start -- process lifecycle: stdio transport + signal handling, not unit-testable */
export async function startMcpDevServer (options: McpDevOptions): Promise<void> {
  const log = createStderrLogger(options.quiet)
  const server = buildMcpServer(options, log)
  const transport = new StdioServerTransport()

  const shutdown = (): void => {
    log('mcp: shutting down')
    void server.close().finally(() => process.exit(0))
  }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)

  await server.connect(transport)
  log(`mcp: ${resolveTools(options).length} tools ready on stdio — press Ctrl+C to stop`)
}
/* v8 ignore stop */
