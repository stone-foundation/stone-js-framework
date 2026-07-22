import { MCP_PLATFORM } from '../src/declarations'
import { Mcp } from '../src/decorators/Mcp'
import { toContent } from '../src/toContent'
import { defineMcp, defineMcpTool, defineMcpTools } from '../src/defineMcpTool'
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

describe('SetMcpKernelMiddleware', () => {
  const blueprint = (platform: string, tools: unknown[] = []): any => {
    const store: Record<string, unknown> = { 'stone.adapter.platform': platform, 'stone.mcp': { tools } }
    return { store, get: (k: string, fb?: unknown) => store[k] ?? fb, set (k: string, v: unknown) { store[k] = v; return this } }
  }

  it('maps each tool to a key-route and sets a response resolver, owning no routing itself', async () => {
    const handler = async (): Promise<string> => 'pong'
    const bp = blueprint(MCP_PLATFORM, [{ name: 'ping', handler }])
    await SetMcpKernelMiddleware({ blueprint: bp } as any, (async () => bp) as any)

    // Each tool becomes a key-route (name -> handler); the app's @KeyRouting owns the dispatch.
    expect(bp.store['stone.keyRouting.definitions']).toEqual([{ key: 'ping', module: handler }])
    expect(typeof bp.store['stone.kernel.responseResolver']).toBe('function')
    // The adapter does NOT seize the kernel event handler (no custom dispatcher).
    expect(bp.store['stone.kernel.eventHandler']).toBeUndefined()
  })

  it('does nothing for another platform', async () => {
    const bp = blueprint('node_http')
    await SetMcpKernelMiddleware({ blueprint: bp } as any, (async () => bp) as any)
    expect(bp.store['stone.keyRouting.definitions']).toBeUndefined()
    expect(bp.store['stone.kernel.responseResolver']).toBeUndefined()
  })
})

describe('helpers, blueprint, decorator', () => {
  it('defineMcpTool is an identity, defineMcpTools builds a fragment', () => {
    const tool = { name: 't', handler: async () => 1 }
    expect(defineMcpTool(tool)).toBe(tool)
    expect(defineMcpTools([tool])).toEqual({ stone: { mcp: { tools: [tool] } } })
  })

  it('defineMcp builds a full stone.mcp fragment', () => {
    const tool = { name: 't', handler: async () => 1 }
    expect(defineMcp({ name: 'app', version: '1.0.0', instructions: 'hi', tools: [tool] }))
      .toEqual({ stone: { mcp: { name: 'app', version: '1.0.0', instructions: 'hi', tools: [tool] } } })
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

describe('mcpAdapterResolver', () => {
  it('resolver creates a McpAdapter', async () => {
    const { mcpAdapterResolver } = await import('../src/resolvers')
    const { McpAdapter } = await import('../src/McpAdapter')
    const bp: any = { get: (_k: string, fb?: unknown) => fb, set: () => {}, has: () => false, getAll: () => ({}) }
    expect(mcpAdapterResolver(bp)).toBeInstanceOf(McpAdapter)
  })
})
