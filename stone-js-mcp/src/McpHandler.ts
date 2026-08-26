import { McpToolRegistry } from './McpToolRegistry'
import { IBlueprint, IContainer, ILogger } from '@stone-js/core'
import { IncomingHttpEvent, jsonHttpResponse, OutgoingHttpResponse } from '@stone-js/http-core'
import { JSONRPC_ERROR_CODES, McpError } from './errors/McpError'
import { JSONRPC_VERSION, LATEST_PROTOCOL_VERSION, SUPPORTED_PROTOCOL_VERSIONS } from './constants'
import { JsonSchema, McpConfig, McpToolRoute, RouteLike, RouterLike } from './declarations'

/** One JSON-RPC message, as it arrives. */
interface JsonRpcMessage {
  jsonrpc?: string
  id?: string | number | null
  method?: string
  params?: Record<string, unknown>
}

/**
 * The endpoint an agent talks to.
 *
 * **It is one POST route.** No socket, no event stream, no session. A client posts JSON-RPC, the
 * server answers JSON, the connection closes. That is a complete and conformant MCP server for a
 * surface that never pushes, and it is why this runs unchanged on a long-lived Node server, on a
 * Lambda, or at the edge: there is nothing to keep open.
 *
 * A stream would only be needed for the things a server sends unprompted, progress on a long tool
 * or a server-initiated sampling request. An API exposing its own routes as tools sends none of
 * them, so requiring a stream would buy nothing and cost every deployment that cannot hold one.
 */
export class McpHandler {
  private readonly blueprint: IBlueprint
  private readonly container?: IContainer
  private readonly registry: McpToolRegistry

  /**
   * @param dependencies - Auto-wired services.
   */
  constructor ({ blueprint, container }: { blueprint: IBlueprint, container?: IContainer }) {
    this.blueprint = blueprint
    this.container = container
    this.registry = new McpToolRegistry({ blueprint, container })
  }

  /**
   * Answer one MCP request.
   *
   * @param event - The incoming event.
   * @returns The response.
   */
  async handle (event: IncomingHttpEvent): Promise<OutgoingHttpResponse> {
    const payload = event.getBody<unknown>() ?? {}

    // A batch is a list, and every reply is one too. The revision that removed batching simply
    // never sends a list, so answering both costs nothing and refuses nobody.
    if (Array.isArray(payload)) {
      const replies = (await Promise.all(payload.map(async (m) => await this.answer(m as JsonRpcMessage, event))))
        .filter((reply) => reply !== undefined)

      return replies.length === 0 ? this.accepted() : jsonHttpResponse(replies, 200)
    }

    const reply = await this.answer(payload as JsonRpcMessage, event)

    return reply === undefined ? this.accepted() : jsonHttpResponse(reply, 200)
  }

  /**
   * One message answered, or nothing when it was a notification.
   *
   * A JSON-RPC message with no `id` is a notification: it expects no reply, and answering one
   * anyway is how a client ends up waiting for a correlation that never comes.
   *
   * @param message - The message.
   * @param event - The request it arrived on.
   * @returns The reply, or nothing.
   */
  private async answer (message: JsonRpcMessage, event: IncomingHttpEvent): Promise<unknown> {
    const isNotification = message.id === undefined || message.id === null

    try {
      const result = await this.route(message, event)

      return isNotification ? undefined : { jsonrpc: JSONRPC_VERSION, id: message.id, result }
    } catch (error: any) {
      if (isNotification) { return undefined }

      const code = error instanceof McpError ? error.jsonRpcCode : JSONRPC_ERROR_CODES.internalError

      this.logger()?.error?.('[@stone-js/mcp] a message could not be answered', {
        method: message.method,
        reason: error?.message
      })

      return {
        jsonrpc: JSONRPC_VERSION,
        id: message.id,
        error: { code, message: String(error?.message ?? 'Internal error') }
      }
    }
  }

  /**
   * What each method answers.
   *
   * @param message - The message.
   * @param event - The request it arrived on.
   * @returns The result.
   * @throws {McpError} When the method is unknown or its params are not usable.
   */
  private async route (message: JsonRpcMessage, event: IncomingHttpEvent): Promise<unknown> {
    switch (message.method) {
      case 'initialize':
        return this.initialize(message.params)
      case 'notifications/initialized':
      case 'notifications/cancelled':
        return {}
      case 'ping':
        return {}
      case 'tools/list':
        return { tools: (await this.registry.tools()).map(({ tool }) => tool) }
      case 'tools/call':
        return await this.call(message.params, event)
      default:
        throw new McpError(`Unknown method: ${String(message.method)}`, {
          jsonRpcCode: JSONRPC_ERROR_CODES.methodNotFound
        })
    }
  }

  /**
   * What this server is, and which revision of the protocol it will speak.
   *
   * The client's revision is echoed when this server knows it; otherwise the newest one it knows is
   * offered and the client decides. Answering a revision nobody asked for without saying so is how
   * two conformant halves end up disagreeing about the shape of a message.
   *
   * @param params - What the client sent.
   * @returns The server's half of the handshake.
   */
  private initialize (params?: Record<string, unknown>): unknown {
    const asked = params?.protocolVersion
    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(asked as any)
      ? asked
      : LATEST_PROTOCOL_VERSION

    const options = this.options()

    return {
      protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: {
        name: options.name ?? this.blueprint.get<string>('stone.name', 'stone-app'),
        version: options.version ?? '0.0.0'
      },
      ...(options.instructions !== undefined ? { instructions: options.instructions } : {})
    }
  }

  /**
   * Run a tool, which means dispatching a real request to the route behind it.
   *
   * This is the whole security model, and it is deliberately not a model at all: the call goes
   * through the router, so the route's own chain runs. Rate limit, authentication, authorization,
   * validation, in the order they already run for a human. A module that called the handler directly
   * would turn every annotated route into a way around its own guard, and nothing would report it.
   *
   * The caller's headers travel with it, so the bearer an agent was given is the bearer the route
   * authenticates. An agent acts for someone; that someone is the principal.
   *
   * @param params - What the client sent.
   * @param event - The request it arrived on.
   * @returns The tool result.
   * @throws {McpError} When the arguments are unusable or the tool does not exist.
   */
  private async call (params: Record<string, unknown> | undefined, event: IncomingHttpEvent): Promise<unknown> {
    const name = params?.name

    if (typeof name !== 'string') {
      throw new McpError('A tool call must name the tool to call.', {
        jsonRpcCode: JSONRPC_ERROR_CODES.invalidParams
      })
    }

    const args = params?.arguments ?? {}

    if (typeof args !== 'object' || args === null || Array.isArray(args)) {
      throw new McpError('Tool arguments must be an object.', {
        jsonRpcCode: JSONRPC_ERROR_CODES.invalidParams
      })
    }

    const found = await this.registry.find(name)

    if (found === undefined) {
      // Unknown tool is a protocol error: the agent asked for something that is not on the list it
      // was given, so there is no result to report, only a mistaken message.
      throw new McpError(`Unknown tool: ${name}`, { jsonRpcCode: JSONRPC_ERROR_CODES.invalidParams })
    }

    try {
      const result = await this.dispatch(found, args as Record<string, unknown>, event)

      return this.toolResult(result, found.tool.outputSchema)
    } catch (error: any) {
      // A tool that fails is a **result**, not a protocol error. An agent reads it, explains it and
      // tries something else; a JSON-RPC error would end the exchange over something recoverable,
      // and a refused authorization is exactly that.
      this.logger()?.warn('[@stone-js/mcp] a tool call failed', { tool: name, reason: error?.message })

      return {
        content: [{ type: 'text', text: String(error?.message ?? 'The tool failed.') }],
        isError: true
      }
    }
  }

  /**
   * The tool call, as the request it becomes.
   *
   * Path parameters are filled from the arguments; what remains travels as a body when the method
   * carries one and as a query when it does not, which is where the route would look for it anyway.
   *
   * @param found - The tool and its route.
   * @param args - The arguments the agent sent.
   * @param event - The request it arrived on.
   * @returns Whatever the route answered.
   */
  private async dispatch (
    found: McpToolRoute,
    args: Record<string, unknown>,
    event: IncomingHttpEvent
  ): Promise<unknown> {
    const { path, rest } = this.fillPath(found.route, args)
    const method = (found.route.getOption<string>('method') ?? 'GET').toUpperCase()
    const carriesBody = ['POST', 'PUT', 'PATCH'].includes(method)
    const url = new URL(path, event.url ?? 'http://localhost')
    const query = new URLSearchParams()

    if (!carriesBody) {
      for (const [key, value] of Object.entries(rest)) {
        query.set(key, String(value))
        url.searchParams.set(key, String(value))
      }
    }

    const inner = IncomingHttpEvent.create({
      url,
      method: method as any,
      // The same source, because it is the same request: nothing about where this came from changed
      // when the agent named a tool instead of a path.
      source: event.source,
      ip: event.ip ?? '127.0.0.1',
      // The caller's own headers and cookies, so the route authenticates the agent's principal
      // rather than nobody. Everything the route trusts about a request, it still trusts about this
      // one. The locale travels too, so a tool answers in the language the caller asked for.
      headers: event.headers as any,
      cookies: event.cookies,
      locale: event.locale,
      // The event reads its query from `queryString`, not from the URL, so both are set: the URL is
      // what the router matches, the string is what the handler reads.
      ...(carriesBody ? { body: rest } : { queryString: query.toString() })
    })

    const response: any = await this.router().dispatch(inner)

    return response?.content ?? response
  }

  /**
   * The route's path with its parameters filled in, and what the arguments still hold.
   *
   * @param route - The route.
   * @param args - The arguments.
   * @returns The path and the remaining arguments.
   */
  private fillPath (route: RouteLike, args: Record<string, unknown>): { path: string, rest: Record<string, unknown> } {
    const rest = { ...args }

    const path = (route.getOption<string>('path') ?? '/').replace(/:([A-Za-z0-9_]+)\??(\([^)]*\))?/g, (match, name: string) => {
      const value = rest[name]

      if (value === undefined) { return match }

      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete rest[name]

      return encodeURIComponent(String(value))
    })

    return { path, rest }
  }

  /**
   * What the route answered, in the shape a tool result takes.
   *
   * Text always, because every client can read it. `structuredContent` as well when the tool
   * promised a shape: sending a structured result nobody was told to expect is how a client ends up
   * validating against a schema that does not exist.
   *
   * @param result - What the route answered.
   * @param outputSchema - The shape the tool declared, if any.
   * @returns The tool result.
   */
  private toolResult (result: unknown, outputSchema?: JsonSchema): unknown {
    const text = typeof result === 'string' ? result : JSON.stringify(result ?? null)
    const structured = outputSchema !== undefined && typeof result === 'object' && result !== null && !Array.isArray(result)

    return {
      content: [{ type: 'text', text }],
      ...(structured ? { structuredContent: result } : {})
    }
  }

  /** A notification is acknowledged, not answered. */
  private accepted (): OutgoingHttpResponse {
    return jsonHttpResponse(undefined, 202)
  }

  /** The router, which is what makes a tool call a real request. */
  private router (): RouterLike {
    return this.container?.make<RouterLike>('router') as RouterLike
  }

  /** The `stone.mcp` bucket. */
  private options (): McpConfig {
    return this.blueprint.get<McpConfig>('stone.mcp', {})
  }

  /** The logger, when one is bound. */
  private logger (): ILogger | undefined {
    return this.container?.has?.('logger') === true ? this.container.make<ILogger>('logger') : undefined
  }
}
