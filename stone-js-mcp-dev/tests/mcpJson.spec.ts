import { mcpServerEntry, mergeMcpJson, initMcpJson, hasMcpJson } from '../src/mcpJson'

describe('mcpServerEntry', () => {
  it('launches `stone mcp` by default', () => {
    expect(mcpServerEntry()).toEqual({ command: 'stone', args: ['mcp'] })
    expect(mcpServerEntry('npx').command).toBe('npx')
  })
})

describe('mergeMcpJson', () => {
  it('adds the stone entry when the file does not exist', () => {
    const { config, changed } = mergeMcpJson(undefined)
    expect(changed).toBe(true)
    expect((config.mcpServers as any).stone).toEqual({ command: 'stone', args: ['mcp'] })
  })

  it('keeps other servers and adds stone', () => {
    const { config, changed } = mergeMcpJson({ mcpServers: { other: { command: 'x' } } })
    expect(changed).toBe(true)
    expect((config.mcpServers as any).other).toEqual({ command: 'x' })
    expect((config.mcpServers as any).stone).toBeDefined()
  })

  it('does not overwrite an existing stone entry', () => {
    const { config, changed } = mergeMcpJson({ mcpServers: { stone: { command: 'custom', args: [] } } })
    expect(changed).toBe(false)
    expect((config.mcpServers as any).stone).toEqual({ command: 'custom', args: [] })
  })
})

describe('initMcpJson', () => {
  const makeIo = (files: Record<string, string>): any => ({
    exists: vi.fn((p: string) => p in files),
    read: vi.fn((p: string) => files[p]),
    write: vi.fn((p: string, c: string) => { files[p] = c })
  })

  it('writes a new file when absent', () => {
    const io = makeIo({})
    const { file, changed } = initMcpJson('/proj', io)
    expect(file).toBe('/proj/.mcp.json')
    expect(changed).toBe(true)
    expect(io.write).toHaveBeenCalled()
    expect(JSON.parse(io.write.mock.calls[0][1]).mcpServers.stone).toBeDefined()
  })

  it('does not rewrite when stone is already registered', () => {
    const io = makeIo({ '/proj/.mcp.json': JSON.stringify({ mcpServers: { stone: { command: 'stone', args: ['mcp'] } } }) })
    const { changed } = initMcpJson('/proj', io)
    expect(changed).toBe(false)
    expect(io.write).not.toHaveBeenCalled()
  })

  it('treats invalid JSON as empty and writes', () => {
    const io = makeIo({ '/proj/.mcp.json': '{ not json' })
    const { changed } = initMcpJson('/proj', io)
    expect(changed).toBe(true)
    expect(io.write).toHaveBeenCalled()
  })
})

describe('hasMcpJson', () => {
  it('reports existence at cwd', () => {
    const io: any = { exists: (p: string) => p === '/proj/.mcp.json', read: () => '', write: () => {} }
    expect(hasMcpJson('/proj', io)).toBe(true)
    expect(hasMcpJson('/other', io)).toBe(false)
  })
})
