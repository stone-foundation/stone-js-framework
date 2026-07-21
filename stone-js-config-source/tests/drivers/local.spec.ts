import { envSource } from '../../src/drivers/EnvConfigSource'
import { fileSource } from '../../src/drivers/FileConfigSource'
import { httpSource } from '../../src/drivers/HttpConfigSource'
import { ConfigSourceError } from '../../src/errors/ConfigSourceError'

const h = vi.hoisted(() => ({ readFile: vi.fn() }))
vi.mock('node:fs/promises', () => ({ readFile: h.readFile }))

describe('EnvConfigSource', () => {
  it('reads env, skips undefined, and honours a prefix (stripped)', async () => {
    const env = { PLAIN: 'p', APP_DB: 'x', APP_PORT: '80', MISSING: undefined }
    expect(await envSource({ env }).load()).toEqual({ PLAIN: 'p', APP_DB: 'x', APP_PORT: '80' })
    expect(await envSource({ env, prefix: 'APP_' }).load()).toEqual({ DB: 'x', PORT: '80' })
    expect(envSource().name).toBe('env')
  })

  it('defaults to process.env', async () => {
    process.env.STONE_CS_TEST = 'yes'
    expect(await envSource({ prefix: 'STONE_CS_' }).load()).toEqual({ TEST: 'yes' })
    delete process.env.STONE_CS_TEST
  })
})

describe('FileConfigSource', () => {
  beforeEach(() => { h.readFile.mockReset() })

  it('reads and parses a json file', async () => {
    h.readFile.mockResolvedValue('{"a":1}')
    expect(await fileSource({ path: '/c.json' }).load()).toEqual({ a: 1 })
  })

  it('parses yaml by extension', async () => {
    h.readFile.mockResolvedValue('a: 1')
    expect(await fileSource({ path: '/c.yaml' }).load()).toEqual({ a: 1 })
  })

  it('returns {} for a missing optional file, throws otherwise', async () => {
    h.readFile.mockRejectedValue(new Error('ENOENT'))
    expect(await fileSource({ path: '/nope.json', optional: true }).load()).toEqual({})
    await expect(fileSource({ path: '/nope.json' }).load()).rejects.toThrow(ConfigSourceError)
  })
})

describe('HttpConfigSource', () => {
  it('fetches and parses json (custom fetch)', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, text: async () => '{"a":1}' })
    expect(await httpSource({ url: 'https://x/c.json', fetch: fetchFn as any, headers: { Authorization: 't' } }).load()).toEqual({ a: 1 })
    expect(fetchFn).toHaveBeenCalledWith('https://x/c.json', { headers: { Authorization: 't' } })
  })

  it('parses yaml by url extension', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, text: async () => 'a: 1' })
    expect(await httpSource({ url: 'https://x/c.yaml', fetch: fetchFn as any }).load()).toEqual({ a: 1 })
  })

  it('throws on a non-ok response', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    await expect(httpSource({ url: 'https://x/c.json', fetch: fetchFn as any }).load()).rejects.toThrow(/404/)
  })

  it('throws when no fetch is available', async () => {
    vi.stubGlobal('fetch', undefined)
    await expect(httpSource({ url: 'https://x/c.json' }).load()).rejects.toThrow(ConfigSourceError)
    vi.unstubAllGlobals()
  })
})
