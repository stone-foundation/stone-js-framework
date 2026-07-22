import { initMcpJson } from '../src/mcpJson'
import { McpDevError } from '../src/errors/McpDevError'
import { startMcpDevServer } from '../src/McpDevServer'
import { McpCommand, mcpCommandOptions } from '../src/commands/McpCommand'

vi.mock('../src/McpDevServer', () => ({ startMcpDevServer: vi.fn(async () => {}) }))
vi.mock('../src/mcpJson', () => ({ initMcpJson: vi.fn(() => ({ file: '/proj/.mcp.json', changed: true })) }))

const makeContainer = (config: Record<string, unknown> = {}): any => {
  const store: Record<string, unknown> = { 'stone.mcpDev': config }
  const blueprint = { get: vi.fn((k: string, fb: unknown) => (k in store ? store[k] : fb)) }
  return { make: vi.fn(() => blueprint), blueprint }
}

describe('McpCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws when no container is provided', () => {
    expect(() => new McpCommand(undefined as any)).toThrow(McpDevError)
  })

  it('declares the --init, --name and --quiet options', () => {
    const option = vi.fn().mockReturnThis()
    mcpCommandOptions.options?.({ option } as any)
    expect(option).toHaveBeenCalledWith('init', expect.any(Object))
    expect(option).toHaveBeenCalledWith('name', expect.any(Object))
    expect(option).toHaveBeenCalledWith('quiet', expect.any(Object))
  })

  it('with --init writes .mcp.json and does NOT start the server', async () => {
    const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
    const container = makeContainer()
    const event = { getMetadataValue: vi.fn((k: string, fb: unknown) => (k === 'init' ? true : fb)) } as any

    await new McpCommand(container).handle(event)

    expect(initMcpJson).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('registered this server'))
    expect(startMcpDevServer).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('starts the server with introspection + user tools and the resolved flags', async () => {
    const container = makeContainer({ name: 'cfg', quiet: false, tools: [{ name: 'mine', handler: () => 'ok' }] })
    const event = { getMetadataValue: vi.fn((k: string, fb: unknown) => (k === 'name' ? 'flag-name' : fb)) } as any

    await new McpCommand(container).handle(event)

    expect(container.make).toHaveBeenCalledWith('blueprint')
    const arg = (startMcpDevServer as any).mock.calls[0][0]
    expect(arg.name).toBe('flag-name')
    expect(arg.quiet).toBe(false)
    expect(arg.tools.some((t: any) => t.name === 'stone_routes')).toBe(true)
    expect(arg.tools.some((t: any) => t.name === 'mine')).toBe(true)
  })
})
