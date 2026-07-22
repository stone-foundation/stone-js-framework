import { toContent } from './toContent'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { DEFAULT_MCP_INSTRUCTIONS, McpAdapterContext, McpExecutionContext, McpOptions, MCP_PLATFORM } from './declarations'
import {
  Adapter,
  IBlueprint,
  IncomingEvent,
  OutgoingResponse,
  AdapterEventBuilder,
  IRawResponseWrapper,
  IncomingEventOptions
} from '@stone-js/core'

/**
 * Model Context Protocol adapter for Stone.js.
 *
 * MCP is just another Continuum context: a tool call is a *cause* that becomes an `IncomingEvent`,
 * flows through the kernel (middleware, DI, hooks) and is routed by the framework's key-router to
 * the tool's handler, and its result is returned as MCP content. `run()` starts an MCP server
 * (stdio by default) advertising every configured tool.
 *
 * This is a TOOLS adapter: it exposes the tools you declare in `stone.mcp.tools` (each backed by a
 * key-routed handler), not an arbitrary HTTP-route app. Turning an existing routed HTTP API into
 * MCP tools is a separate concern (a router-to-MCP bridge), not this adapter.
 */
export class McpAdapter extends Adapter<
IncomingEvent,
OutgoingResponse,
McpExecutionContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
McpAdapterContext
> {
  /**
   * @param blueprint - The application blueprint.
   * @returns A new adapter instance.
   */
  static create (blueprint: IBlueprint): McpAdapter {
    return new this(blueprint)
  }

  /**
   * Start the MCP server, register the tools and connect the transport.
   *
   * @returns The connected MCP server.
   */
  async run<ExecutionResultType = McpServer>(): Promise<ExecutionResultType> {
    await this.onStart()

    const options = this.blueprint.get<McpOptions>('stone.mcp', {})
    const server = new McpServer(
      { name: options.name ?? 'stone-app', version: options.version ?? '0.0.0' },
      { instructions: options.instructions ?? DEFAULT_MCP_INSTRUCTIONS }
    )

    for (const tool of options.tools ?? []) {
      server.registerTool(
        tool.name,
        { description: tool.description, inputSchema: (tool.inputSchema ?? {}) as never },
        (async (args: Record<string, unknown>) => await this.dispatch(tool.name, args ?? {})) as never
      )
    }

    const transport = this.blueprint.get<StdioServerTransport>('stone.adapter.transport', new StdioServerTransport())
    await server.connect(transport)

    return server as ExecutionResultType
  }

  /**
   * Lifecycle hook run once before serving.
   */
  protected async onStart (): Promise<void> {
    await this.executeHooks('onStart')
  }

  /**
   * Dispatch one tool call through the kernel and return an MCP tool result.
   *
   * @param name - The tool name.
   * @param args - The validated arguments.
   * @returns The MCP tool result.
   */
  protected async dispatch (name: string, args: Record<string, unknown>): Promise<ReturnType<typeof toContent>> {
    // Normalise the tool call into an IncomingEvent keyed by the tool name, exactly like every
    // other Stone.js event adapter (`detail-type` = key, `detail` = payload). The kernel's
    // key-router then routes it to the tool's handler — the adapter owns no routing itself.
    const rawEvent = { 'detail-type': name, detail: args }
    const event = IncomingEvent.create({
      source: { rawEvent, platform: MCP_PLATFORM, rawContext: {} },
      // The key-router reads the raw event under the `metadata` key (event.get('metadata')),
      // exactly like node-ws: `detail-type` is the routing key, `detail` the payload.
      metadata: { metadata: rawEvent }
    })

    const incomingEventBuilder = AdapterEventBuilder.create<IncomingEventOptions, IncomingEvent>({ resolver: () => event })
    const rawResponseBuilder = AdapterEventBuilder.create<Record<PropertyKey, unknown>, IRawResponseWrapper<OutgoingResponse>>({
      // Never invoked: buildRawResponse is overridden to return the outgoing response directly.
      /* v8 ignore next */
      resolver: () => ({ respond: () => undefined as unknown as OutgoingResponse })
    })

    const context: McpAdapterContext = { rawEvent: event, executionContext: {}, incomingEventBuilder, rawResponseBuilder }

    const eventHandler = this.resolveEventHandler()
    await this.executeEventHandlerHooks('onInit', eventHandler)
    const response = await this.sendEventThroughDestination(context, eventHandler)

    return toContent(response)
  }

  /**
   * The raw response IS the outgoing response the kernel produced.
   *
   * @param context - The adapter context.
   * @returns The outgoing response.
   */
  protected async buildRawResponse (context: McpAdapterContext): Promise<OutgoingResponse> {
    return context.outgoingResponse as OutgoingResponse
  }
}
