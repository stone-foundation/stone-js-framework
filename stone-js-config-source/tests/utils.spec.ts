import { resolveModuleDefault, parseConfig, formatOf, setPath, transformLeaves } from '../src/utils'
import { ConfigSourceError } from '../src/errors/ConfigSourceError'

describe('utils', () => {
  it('resolveModuleDefault unwraps a default export', () => {
    expect(resolveModuleDefault({ default: 'x' })).toBe('x')
    expect(resolveModuleDefault({ a: 1 })).toEqual({ a: 1 })
  })

  it('formatOf infers yaml from the extension, else json', () => {
    expect(formatOf('a.yaml')).toBe('yaml')
    expect(formatOf('a.yml?ref=main')).toBe('yaml')
    expect(formatOf('a.json')).toBe('json')
    expect(formatOf('https://x/config')).toBe('json')
  })

  it('setPath nests values and refuses prototype-polluting keys', () => {
    const out: Record<string, any> = {}
    setPath(out, ['db', 'url'], 'x')
    setPath(out, ['db', 'port'], 5432)
    expect(out).toEqual({ db: { url: 'x', port: 5432 } })
    setPath(out, ['__proto__', 'polluted'], true)
    expect(({} as any).polluted).toBeUndefined()
  })

  it('parseConfig parses json and yaml, and throws on invalid input', async () => {
    expect(await parseConfig('{"a":1}', 'json')).toEqual({ a: 1 })
    expect(await parseConfig('a: 1\nb: two', 'yaml')).toEqual({ a: 1, b: 'two' })
    expect(await parseConfig('', 'yaml')).toEqual({}) // empty doc -> {}
    await expect(parseConfig('nope', 'json')).rejects.toThrow(ConfigSourceError)
    await expect(parseConfig(':\n  - [', 'yaml')).rejects.toThrow(ConfigSourceError)
  })

  it('transformLeaves applies to every scalar (object, array, leaf) with its key path', async () => {
    const seen: string[] = []
    const out = await transformLeaves(
      { db: { url: 'u' }, tags: ['a', 'b'] },
      (value, key) => { seen.push(key); return typeof value === 'string' ? value.toUpperCase() : value }
    )
    expect(out).toEqual({ db: { url: 'U' }, tags: ['A', 'B'] })
    expect(seen).toContain('db.url')
    expect(seen).toContain('tags[0]')
  })
})

describe('parseConfig without js-yaml', () => {
  it('throws a helpful error', async () => {
    vi.resetModules()
    vi.doMock('js-yaml', () => { throw new Error('Cannot find module') })
    const { parseConfig: fresh } = await import('../src/utils')
    await expect(fresh('a: 1', 'yaml')).rejects.toThrow(/js-yaml/)
    vi.doUnmock('js-yaml')
    vi.resetModules()
  })
})

describe('ConfigSourceError', () => {
  it('is a named integration error', () => {
    expect(new ConfigSourceError('boom').name).toBe('ConfigSourceError')
  })
})
