import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { toToolContent, createStderrLogger, resolveTools, createToolCallback, buildMcpServer } from '../src/McpDevServer'

describe('McpDevServer', () => {
  describe('toToolContent', () => {
    it('wraps a string as-is', () => {
      expect(toToolContent('hello')).toEqual({ content: [{ type: 'text', text: 'hello' }] })
    })

    it('serializes structured data as JSON', () => {
      expect(toToolContent({ a: 1 }).content[0].text).toContain('"a": 1')
    })
  })

  describe('createStderrLogger', () => {
    it('writes to stderr when not quiet', () => {
      const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
      createStderrLogger(false)('hi')
      expect(spy).toHaveBeenCalledWith('hi\n')
      spy.mockRestore()
    })

    it('is a no-op when quiet', () => {
      const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
      createStderrLogger(true)('hi')
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it('defaults to writing (not quiet)', () => {
      const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
      createStderrLogger()('hi')
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('resolveTools', () => {
    it('returns the built-in knowledge tools by default', () => {
      expect(resolveTools({}).some((t) => t.name === 'stone_search')).toBe(true)
    })

    it('appends the app tools', () => {
      const tools = resolveTools({ tools: [{ name: 'my_tool', handler: () => 'ok' }] })
      expect(tools.some((t) => t.name === 'my_tool')).toBe(true)
    })

    it('includes the report tools when configured', () => {
      const tools = resolveTools({ report: { token: 't', repo: 'o/r' } })
      expect(tools.some((t) => t.name === 'stone_report_bug')).toBe(true)
    })
  })

  describe('createToolCallback', () => {
    it('runs the handler, logs, and wraps the result', async () => {
      const logs: string[] = []
      const cb = createToolCallback({ name: 'x', handler: (a) => ({ got: a.n }) }, (m) => logs.push(m))
      const res = await cb({ n: 5 })
      expect(res).toEqual({ content: [{ type: 'text', text: JSON.stringify({ got: 5 }, null, 2) }] })
      expect(logs[0]).toContain('→ x')
      expect(logs[1]).toBe('← x ok')
    })

    it('defaults missing args to an empty object', async () => {
      const cb = createToolCallback({ name: 'x', handler: (a) => Object.keys(a).length }, () => {})
      expect((await cb(undefined as any)).content[0].text).toBe('0')
    })

    it('captures an Error and flags isError', async () => {
      const logs: string[] = []
      const cb = createToolCallback({ name: 'boom', handler: () => { throw new Error('nope') } }, (m) => logs.push(m))
      const res = await cb({})
      expect(res.isError).toBe(true)
      expect(res.content[0].text).toContain('nope')
      expect(logs[1]).toContain('error: nope')
    })

    it('captures a non-Error throw', async () => {
      const cb = createToolCallback({ name: 'boom', handler: () => { throw 'raw' } }, () => {})
      expect((await cb({})).content[0].text).toContain('raw')
    })
  })

  describe('buildMcpServer', () => {
    it('builds a configured MCP server and registers the tools', () => {
      const server = buildMcpServer({ name: 'test', tools: [{ name: 'my_tool', handler: () => 'ok' }] }, () => {})
      expect(server).toBeInstanceOf(McpServer)
    })
  })
})
