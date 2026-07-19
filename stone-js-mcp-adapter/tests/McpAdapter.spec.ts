import { McpAdapter } from '../src/McpAdapter'

const { registerTool, connect, McpServerMock } = vi.hoisted(() => {
  const registerTool = vi.fn()
  const connect = vi.fn(async () => {})
  const McpServerMock = vi.fn(() => ({ registerTool, connect }))
  return { registerTool, connect, McpServerMock }
})

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({ McpServer: McpServerMock }))
vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({ StdioServerTransport: vi.fn(() => ({ kind: 'stdio' })) }))

// A fake kernel that echoes the tool call as an OutgoingResponse-like object.
const fakeKernel = {
  onInit: vi.fn(async () => {}),
  handle: vi.fn(async (event: any) => ({ statusCode: 200, content: `handled:${String(event.get('_mcpTool'))}` }))
}

const blueprintStub = (tools: unknown[]): any => {
  const store: Record<string, unknown> = {
    'stone.mcp': { name: 'lab', version: '1.0.0', tools },
    'stone.adapter.eventHandlerResolver': () => fakeKernel,
    'stone.adapter.middleware': [],
    'stone.lifecycleHooks': {}
  }
  return {
    store,
    get: (k: string, fb?: unknown) => (k in store ? store[k] : fb),
    set: (k: string, v: unknown) => { store[k] = v },
    has: (k: string) => k in store,
    getAll: () => store
  }
}

describe('McpAdapter', () => {
  beforeEach(() => {
    registerTool.mockClear(); connect.mockClear(); McpServerMock.mockClear()
    fakeKernel.handle.mockClear(); fakeKernel.onInit.mockClear()
  })

  it('starts an MCP server, registers every tool and connects a transport', async () => {
    const tools = [
      { name: 'ping', description: 'Ping', handler: async () => 'pong' },
      { name: 'echo', inputSchema: { text: {} }, handler: async (a: any) => a.text }
    ]
    const adapter = McpAdapter.create(blueprintStub(tools))
    const server: any = await adapter.run()

    expect(McpServerMock).toHaveBeenCalledWith({ name: 'lab', version: '1.0.0' })
    expect(registerTool).toHaveBeenCalledTimes(2)
    expect(registerTool.mock.calls[0][0]).toBe('ping')
    expect(connect).toHaveBeenCalledOnce()
    expect(server.registerTool).toBeDefined()
  })

  it('dispatches a tool call through the kernel and returns MCP content', async () => {
    const adapter = McpAdapter.create(blueprintStub([{ name: 'ping', handler: async () => 'pong' }]))
    await adapter.run()

    // Invoke the registered tool callback (what the MCP client would trigger).
    const toolCallback = registerTool.mock.calls[0][2]
    const result = await toolCallback({})

    expect(fakeKernel.onInit).toHaveBeenCalled()
    expect(fakeKernel.handle).toHaveBeenCalled()
    expect(result).toEqual({ content: [{ type: 'text', text: 'handled:ping' }] })
  })

  it('uses a transport provided via config', async () => {
    const bp = blueprintStub([])
    bp.store['stone.adapter.transport'] = { kind: 'custom' }
    await McpAdapter.create(bp).run()
    expect(connect).toHaveBeenCalledWith({ kind: 'custom' })
  })

  it('falls back to default name/version/tools when stone.mcp is empty', async () => {
    const bp = blueprintStub([])
    bp.store['stone.mcp'] = {}
    await McpAdapter.create(bp).run()
    expect(McpServerMock).toHaveBeenCalledWith({ name: 'stone-app', version: '0.0.0' })
    expect(registerTool).not.toHaveBeenCalled()
  })
})
