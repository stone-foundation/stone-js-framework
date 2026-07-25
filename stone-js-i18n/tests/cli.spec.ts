import { loadTranslationsFromDir, mergeResources, createAutoloadMiddleware, i18nCliPlugin } from '../src/cli'
import defaultPlugin from '../src/cli'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
  readFileSync: vi.fn()
}))

import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'

const ROOT = '/proj/app/i18n'
const DIRS = new Set([ROOT, `${ROOT}/en`, `${ROOT}/fr`, `${ROOT}/de`])
const FILES: Record<string, string> = {
  [`${ROOT}/en/common.json`]: '{"hello":"Hello"}',
  [`${ROOT}/en/auth.json`]: '{"login":"Login"}',
  [`${ROOT}/fr/common.json`]: '{"hello":"Bonjour"}'
}
const ENTRIES: Record<string, string[]> = {
  [ROOT]: ['en', 'fr', 'de', 'README.md'], // README.md at the locale level is skipped (not a dir)
  [`${ROOT}/en`]: ['common.json', 'auth.json', 'notes.txt', 'weird.json'], // notes.txt (not json) + weird.json (not a file) skipped
  [`${ROOT}/fr`]: ['common.json'],
  [`${ROOT}/de`]: ['notes.txt'] // only non-json → de contributes nothing
}

function mountFs (): void {
  vi.mocked(existsSync).mockImplementation((p) => p === ROOT)
  vi.mocked(readdirSync).mockImplementation((p) => (ENTRIES[p as string] ?? []) as any)
  vi.mocked(statSync).mockImplementation((p) => ({
    isDirectory: () => DIRS.has(p as string),
    isFile: () => (p as string) in FILES
  }) as any)
  vi.mocked(readFileSync).mockImplementation((p) => FILES[p as string])
}

describe('loadTranslationsFromDir', () => {
  beforeEach(() => { vi.clearAllMocks(); mountFs() })

  it('scans <locale>/<namespace>.json into a resource map', () => {
    expect(loadTranslationsFromDir(ROOT)).toEqual({
      en: { common: { hello: 'Hello' }, auth: { login: 'Login' } },
      fr: { common: { hello: 'Bonjour' } }
    })
  })

  it('skips non-directory locales, non-json files, non-file .json and empty locales', () => {
    const resources = loadTranslationsFromDir(ROOT)
    expect(resources).not.toHaveProperty('README.md')
    expect(resources.en).not.toHaveProperty('notes')
    expect(resources.en).not.toHaveProperty('weird')
    expect(resources).not.toHaveProperty('de')
  })

  it('returns an empty map when the directory is absent', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    expect(loadTranslationsFromDir('/nope')).toEqual({})
  })
})

describe('mergeResources', () => {
  it('merges by locale/namespace, config winning, including config-only locales', () => {
    const scanned = { en: { common: { a: 1 } }, fr: { common: { b: 2 } } }
    const override = { en: { common: { a: 9 }, extra: { c: 3 } }, de: { common: { d: 4 } } }
    expect(mergeResources(scanned, override)).toEqual({
      en: { common: { a: 9 }, extra: { c: 3 } },
      fr: { common: { b: 2 } },
      de: { common: { d: 4 } }
    })
  })
})

describe('createAutoloadMiddleware', () => {
  const cwd = vi.spyOn(process, 'cwd').mockReturnValue('/proj')
  beforeEach(() => { vi.clearAllMocks(); cwd.mockReturnValue('/proj'); mountFs() })

  async function run (config: object): Promise<{ store: Record<string, unknown>, result: unknown }> {
    const store: Record<string, unknown> = {}
    const blueprint = { get: vi.fn().mockReturnValue(config), set: vi.fn((k: string, v: unknown) => { store[k] = v }) }
    const next = vi.fn((ctx: unknown) => ctx)
    const result = await createAutoloadMiddleware('app/i18n')({ blueprint } as any, next as any)
    return { store, result }
  }

  it('autoloads app/i18n by default and merges config over it', async () => {
    const { store } = await run({ resources: { fr: { common: { hello: 'Salut' } } } })
    expect(store['stone.i18n.resources']).toEqual({
      en: { common: { hello: 'Hello' }, auth: { login: 'Login' } },
      fr: { common: { hello: 'Salut' } }
    })
  })

  it('honours a custom directory', async () => {
    vi.mocked(existsSync).mockReturnValue(false)
    await createAutoloadMiddleware('app/i18n')({ blueprint: { get: () => ({ dir: 'translations' }), set: vi.fn() } } as any, ((c: unknown) => c) as any)
    expect(existsSync).toHaveBeenCalledWith('/proj/translations')
  })

  it('is disabled by dir: false', async () => {
    const { store } = await run({ dir: false })
    expect(store['stone.i18n.resources']).toBeUndefined()
    expect(existsSync).not.toHaveBeenCalled()
  })
})

describe('i18nCliPlugin', () => {
  it('describes a Stone CLI plugin with a build-phase blueprint middleware', () => {
    const plugin = i18nCliPlugin()
    expect(plugin.name).toBe('@stone-js/i18n')
    expect(plugin.description).toContain('stone.i18n.resources')
    expect(plugin.blueprintMiddleware).toHaveLength(1)
    expect(plugin.blueprintMiddleware?.[0]).toMatchObject({ priority: 5, module: expect.any(Function) })
  })

  it('exposes a ready default plugin instance for package.json auto-discovery', () => {
    expect(defaultPlugin.name).toBe('@stone-js/i18n')
    expect(defaultPlugin.blueprintMiddleware).toHaveLength(1)
  })
})
