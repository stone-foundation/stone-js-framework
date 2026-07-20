import { toContent } from './toContent'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { McpAdapterContext, McpExecutionContext, McpOptions, MCP_PLATFORM } from './declarations'
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
 * flows through the kernel (middleware, DI, hooks) via the {@link McpDispatcher}, and its result
 * is returned as MCP content. `run()` starts an MCP server (stdio by default) advertising every
 * configured tool — so an AI agent consumes your domain exactly like a REST client would, with no
 * changes to your handlers.
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
    const server = new McpServer({ name: options.name ?? 'stone-app', version: options.version ?? '0.0.0' })

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
    const event = IncomingEvent.create({
      source: { rawEvent: { name, args }, platform: MCP_PLATFORM, rawContext: {} },
      metadata: { _mcpTool: name, _mcpArgs: args, ...args }
    })

    const incomingEventBuilder = AdapterEventBuilder.create<IncomingEventOptions, IncomingEvent>({ resolver: () => event })
    const rawResponseBuilder = AdapterEventBuilder.create<Record<PropertyKey, unknown>, IRawResponseWrapper<OutgoingResponse>>({
      // Never invoked: buildRawResponse is overridden to return the outgoing response directly.
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
