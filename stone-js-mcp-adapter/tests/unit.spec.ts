import { MCP_PLATFORM } from '../src/declarations'
import { Mcp } from '../src/decorators/Mcp'
import { toContent } from '../src/toContent'
import { McpDispatcher } from '../src/McpDispatcher'
import { defineMcpTool, defineMcpTools } from '../src/defineMcpTool'
import { mcpAdapterBlueprint } from '../src/options/McpAdapterBlueprint'
import { SetMcpKernelMiddleware } from '../src/middleware/BlueprintMiddleware'

describe('toContent', () => {
  it('wraps a string response', () => {
    expect(toContent({ statusCode: 200, content: 'hello' } as any)).toEqual({ content: [{ type: 'text', text: 'hello' }] })
  })

  it('JSON-stringifies a non-string response and defaults the status', () => {
    expect(toContent({ content: { a: 1 } } as any)).toEqual({ content: [{ type: 'text', text: '{"a":1}' }] })
  })

  it('marks 4xx/5xx as errors', () => {
    expect(toContent({ statusCode: 500, content: 'boom' } as any).isError).toBe(true)
    expect(toContent({ statusCode: 404, content: null } as any)).toEqual({ content: [{ type: 'text', text: 'null' }], isError: true })
  })
})

describe('McpDispatcher', () => {
  const event = (tool: string, args: Record<string, unknown> = {}): any => ({
    get: (k: string, fb?: unknown) => ({ _mcpTool: tool, _mcpArgs: args }[k] ?? fb)
  })
  const blueprint = (tools: unknown[]): any => ({ get: (_k: string, fb: unknown) => ({ tools, ...(fb as object) }) })

  it('routes a call to the matching tool handler', async () => {
    const handler = vi.fn(async () => ({ ok: true }))
    const dispatcher = new McpDispatcher({ blueprint: blueprint([{ name: 'ping', handler }]) })
    const result = await dispatcher.handle(event('ping', { n: 1 }))
    expect(handler).toHaveBeenCalledWith({ n: 1 }, expect.anything())
    expect(result).toEqual({ ok: true })
  })

  it('throws on an unknown tool', async () => {
    const dispatcher = new McpDispatcher({ blueprint: blueprint([]) })
    await expect(dispatcher.handle(event('nope'))).rejects.toThrow('Unknown MCP tool: nope')
  })
})

describe('SetMcpKernelMiddleware', () => {
  const blueprint = (platform: string): any => {
    const store: Record<string, unknown> = { 'stone.adapter.platform': platform }
    return { store, get: (k: string, fb?: unknown) => store[k] ?? fb, set (k: string, v: unknown) { store[k] = v; return this } }
  }

  it('wires the dispatcher and response resolver for the MCP platform', async () => {
    const bp = blueprint(MCP_PLATFORM)
    await SetMcpKernelMiddleware({ blueprint: bp } as any, (async () => bp) as any)
    expect(bp.store['stone.kernel.eventHandler']).toEqual({ module: McpDispatcher, isClass: true })
    expect(typeof bp.store['stone.kernel.responseResolver']).toBe('function')
  })

  it('does nothing for another platform', async () => {
    const bp = blueprint('node_http')
    await SetMcpKernelMiddleware({ blueprint: bp } as any, (async () => bp) as any)
    expect(bp.store['stone.kernel.eventHandler']).toBeUndefined()
  })
})

describe('helpers, blueprint, decorator', () => {
  it('defineMcpTool is an identity, defineMcpTools builds a fragment', () => {
    const tool = { name: 't', handler: async () => 1 }
    expect(defineMcpTool(tool)).toBe(tool)
    expect(defineMcpTools([tool])).toEqual({ stone: { mcp: { tools: [tool] } } })
  })

  it('mcpAdapterBlueprint registers the adapter', () => {
    const adapter = mcpAdapterBlueprint.stone.adapters?.[0]
    expect(adapter?.platform).toBe(MCP_PLATFORM)
    expect(adapter?.resolver).toBeTypeOf('function')
  })

  it('@Mcp applies without throwing', () => {
    expect(() => {
      @Mcp({ default: true })
      class App {}
      return App
    }).not.toThrow()
  })
})

describe('mcpAdapterResolver + dispatcher defaults', () => {
  it('resolver creates a McpAdapter', async () => {
    const { mcpAdapterResolver } = await import('../src/resolvers')
    const { McpAdapter } = await import('../src/McpAdapter')
    const bp: any = { get: (_k: string, fb?: unknown) => fb, set: () => {}, has: () => false, getAll: () => ({}) }
    expect(mcpAdapterResolver(bp)).toBeInstanceOf(McpAdapter)
  })

  it('dispatcher tolerates a missing tools list', async () => {
    const dispatcher = new McpDispatcher({ blueprint: { get: (_k: string, fb: unknown) => fb } as any })
    await expect(dispatcher.handle({ get: (_k: string, fb?: unknown) => fb } as any)).rejects.toThrow('Unknown MCP tool')
  })
})
