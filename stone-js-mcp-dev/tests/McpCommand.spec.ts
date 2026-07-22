import { McpCommand, mcpCommandOptions } from '../src/commands/McpCommand'
import { McpDevError } from '../src/errors/McpDevError'
import { startMcpDevServer } from '../src/McpDevServer'

vi.mock('../src/McpDevServer', () => ({ startMcpDevServer: vi.fn(async () => {}) }))

describe('McpCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws when no container is provided', () => {
    expect(() => new McpCommand(undefined as any)).toThrow(McpDevError)
  })

  it('declares the --name and --quiet options', () => {
    const option = vi.fn().mockReturnThis()
    mcpCommandOptions.options?.({ option } as any)
    expect(option).toHaveBeenCalledWith('name', expect.any(Object))
    expect(option).toHaveBeenCalledWith('quiet', expect.any(Object))
  })

  it('reads stone.mcpDev, applies the flags, and starts the server', async () => {
    const blueprint = { get: vi.fn(() => ({ name: 'cfg', quiet: false, tools: [] })) }
    const container = { make: vi.fn(() => blueprint) } as any
    const event = { getMetadataValue: vi.fn((k: string, fb: unknown) => (k === 'name' ? 'flag-name' : fb)) } as any

    await new McpCommand(container).handle(event)

    expect(container.make).toHaveBeenCalledWith('blueprint')
    expect(blueprint.get).toHaveBeenCalledWith('stone.mcpDev', {})
    expect(startMcpDevServer).toHaveBeenCalledWith(expect.objectContaining({ name: 'flag-name', quiet: false }))
  })
})
