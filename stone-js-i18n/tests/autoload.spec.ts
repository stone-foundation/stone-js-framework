import { loadTranslationsFromDir } from '../src/server/loadTranslationsFromDir'
import { LoadTranslationsMiddleware, mergeResources, metaServerI18nBlueprintMiddleware } from '../src/server/BlueprintMiddleware'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
  readFileSync: vi.fn()
}))

import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'

/** A virtual `app/i18n` tree rooted at `/proj/app/i18n`. */
const ROOT = '/proj/app/i18n'
const DIRS = new Set([ROOT, `${ROOT}/en`, `${ROOT}/fr`, `${ROOT}/de`])
const FILES: Record<string, string> = {
  [`${ROOT}/en/common.json`]: '{"hello":"Hello"}',
  [`${ROOT}/en/auth.json`]: '{"login":"Login"}',
  [`${ROOT}/fr/common.json`]: '{"hello":"Bonjour"}'
}
const ENTRIES: Record<string, string[]> = {
  [ROOT]: ['en', 'fr', 'de', 'README.md'], // README.md at the locale level is skipped (not a dir)
  [`${ROOT}/en`]: ['common.json', 'auth.json', 'notes.txt', 'weird.json'], // notes.txt (not .json) and weird.json (not a file) are skipped
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

  it('skips non-directory locale entries, non-json files and empty locales', () => {
    const resources = loadTranslationsFromDir(ROOT)
    expect(resources).not.toHaveProperty('README.md')
    expect(resources.en).not.toHaveProperty('notes')
    expect(resources).not.toHaveProperty('de')
  })

  it('returns an empty map when the directory is absent', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    expect(loadTranslationsFromDir('/nope')).toEqual({})
  })
})

describe('mergeResources', () => {
  it('merges by locale and namespace, config winning', () => {
    const scanned = { en: { common: { a: 1 } }, fr: { common: { b: 2 } } }
    const override = { en: { common: { a: 9 }, extra: { c: 3 } }, de: { common: { d: 4 } } }
    expect(mergeResources(scanned, override)).toEqual({
      en: { common: { a: 9 }, extra: { c: 3 } },
      fr: { common: { b: 2 } },
      de: { common: { d: 4 } } // config-only locale, not on disk
    })
  })
})

describe('LoadTranslationsMiddleware', () => {
  const cwd = vi.spyOn(process, 'cwd').mockReturnValue('/proj')
  beforeEach(() => { vi.clearAllMocks(); cwd.mockReturnValue('/proj'); mountFs() })

  function run (config: object): { set: any, blueprint: any, result: unknown } {
    const store: Record<string, unknown> = {}
    const blueprint = {
      get: vi.fn().mockReturnValue(config),
      set: vi.fn((key: string, value: unknown) => { store[key] = value })
    }
    const next = vi.fn((ctx: unknown) => ctx)
    const result = LoadTranslationsMiddleware({ blueprint } as any, next as any)
    return { set: blueprint.set, blueprint, result }
  }

  it('autoloads app/i18n by default and merges config over it', () => {
    const { set } = run({ resources: { fr: { common: { hello: 'Salut' } } } })
    expect(set).toHaveBeenCalledWith('stone.i18n.resources', {
      en: { common: { hello: 'Hello' }, auth: { login: 'Login' } },
      fr: { common: { hello: 'Salut' } } // config wins
    })
  })

  it('honours a custom directory', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    run({ dir: 'translations' })
    expect(existsSync).toHaveBeenCalledWith('/proj/translations')
  })

  it('is disabled by dir: false', () => {
    const { set } = run({ dir: false })
    expect(set).not.toHaveBeenCalled()
    expect(existsSync).not.toHaveBeenCalled()
  })

  it('exposes a prioritised blueprint middleware entry', () => {
    expect(metaServerI18nBlueprintMiddleware).toEqual([{ module: LoadTranslationsMiddleware, priority: 5 }])
  })
})
