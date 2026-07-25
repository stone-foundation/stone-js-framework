import defaultPlugin, {
  i18nCliPlugin,
  toImportSpecifier,
  generateI18nModule,
  scanTranslationFiles,
  GENERATED_MODULE,
  DEFAULT_I18N_DIR
} from '../src/cli'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn()
}))

import { existsSync, readdirSync, statSync } from 'node:fs'

const ROOT = `/proj/${DEFAULT_I18N_DIR}`
const DIRS = new Set([ROOT, `${ROOT}/en`, `${ROOT}/fr`])
const ENTRIES: Record<string, string[]> = {
  [ROOT]: ['en', 'fr', 'README.md'], // README.md at locale level is skipped (not a dir)
  [`${ROOT}/en`]: ['common.json', 'auth.json', 'notes.txt'], // notes.txt (unlisted ext) skipped
  [`${ROOT}/fr`]: ['common.json']
}
const FILES = new Set([
  `${ROOT}/en/common.json`, `${ROOT}/en/auth.json`, `${ROOT}/fr/common.json`, `${ROOT}/en/notes.txt`
])

function mountFs (): void {
  vi.mocked(existsSync).mockImplementation((p) => p === ROOT)
  vi.mocked(readdirSync).mockImplementation((p) => (ENTRIES[p as string] ?? []) as any)
  vi.mocked(statSync).mockImplementation((p) => ({
    isDirectory: () => DIRS.has(p as string),
    isFile: () => FILES.has(p as string)
  }) as any)
}

describe('scanTranslationFiles', () => {
  beforeEach(() => { vi.clearAllMocks(); mountFs() })

  it('returns matching files sorted, skipping non-dir locales and unlisted extensions', () => {
    expect(scanTranslationFiles(ROOT, ['json'])).toEqual([
      `${ROOT}/en/auth.json`,
      `${ROOT}/en/common.json`,
      `${ROOT}/fr/common.json`
    ])
  })

  it('returns an empty list when the directory is absent', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    expect(scanTranslationFiles('/nope', ['json'])).toEqual([])
  })
})

describe('toImportSpecifier', () => {
  it('builds a relative POSIX specifier keeping the locale/namespace tail', () => {
    expect(toImportSpecifier('/proj/.stone/tmp/plugins', `${ROOT}/en/common.json`))
      .toBe('../../../app/i18n/en/common.json')
  })

  it('prefixes ./ when the file sits under the module directory', () => {
    expect(toImportSpecifier('/proj/.stone/tmp', '/proj/.stone/tmp/x/en/common.json'))
      .toBe('./x/en/common.json')
  })
})

describe('generateI18nModule', () => {
  const moduleDir = '/proj/.stone/tmp/plugins'
  const files = [`${ROOT}/en/common.json`, `${ROOT}/fr/common.json`]

  it('emits eager static imports handed to loadTranslations', () => {
    const source = generateI18nModule(moduleDir, files, false)
    expect(source).toContain("import { defineI18n, loadTranslations } from '@stone-js/i18n'")
    expect(source).toContain('import * as __i18n0 from "../../../app/i18n/en/common.json"')
    expect(source).toContain('loadTranslations({')
    expect(source).toContain('"../../../app/i18n/en/common.json": __i18n0')
    expect(source).not.toContain('import.meta.glob')
  })

  it('emits lazy per-file dynamic importers as loaders', () => {
    const source = generateI18nModule(moduleDir, files, true)
    expect(source).toContain("import { defineI18n } from '@stone-js/i18n'")
    expect(source).toContain('loaders: {')
    expect(source).toContain('"../../../app/i18n/en/common.json": () => import("../../../app/i18n/en/common.json")')
    expect(source).not.toContain('loadTranslations')
  })
})

describe('i18nCliPlugin', () => {
  const cwd = vi.spyOn(process, 'cwd').mockReturnValue('/proj')

  const makeContext = (): { writeFile: any, addModule: any, buildPath: any } => ({
    writeFile: vi.fn(),
    addModule: vi.fn(),
    buildPath: (rel: string) => `/proj/.stone/tmp/${rel}`
  })

  beforeEach(() => { vi.clearAllMocks(); cwd.mockReturnValue('/proj'); mountFs() })

  it('is a Stone CLI plugin with an onPrepare hook and no legacy blueprint middleware', () => {
    const plugin = i18nCliPlugin()
    expect(plugin.name).toBe('@stone-js/i18n')
    expect(plugin.description).toContain(DEFAULT_I18N_DIR)
    expect(typeof plugin.onPrepare).toBe('function')
    expect(plugin.blueprintMiddleware).toBeUndefined()
  })

  it('scans and generates the eager module, then contributes it to the app', () => {
    const context = makeContext()
    i18nCliPlugin().onPrepare?.(context as any)

    expect(context.writeFile).toHaveBeenCalledWith(GENERATED_MODULE, expect.stringContaining('loadTranslations({'))
    expect(context.writeFile).toHaveBeenCalledWith(GENERATED_MODULE, expect.stringContaining('en/common.json'))
    expect(context.addModule).toHaveBeenCalledWith(`./${GENERATED_MODULE}`)
  })

  it('generates lazy loaders when lazy is enabled', () => {
    const context = makeContext()
    const plugin = i18nCliPlugin({ lazy: true })
    plugin.onPrepare?.(context as any)

    expect(plugin.description).toContain('(lazy)')
    expect(context.writeFile).toHaveBeenCalledWith(GENERATED_MODULE, expect.stringContaining('() => import('))
  })

  it('honours a custom dir and extensions', () => {
    const context = makeContext()
    vi.mocked(existsSync).mockReturnValue(false) // custom dir absent -> empty scan, still writes an (empty) module
    i18nCliPlugin({ dir: 'translations', extensions: 'json' }).onPrepare?.(context as any)
    expect(existsSync).toHaveBeenCalledWith('/proj/translations')
    expect(context.addModule).toHaveBeenCalledWith(`./${GENERATED_MODULE}`)
  })

  it('exposes a ready default plugin instance for package.json auto-discovery', () => {
    expect(defaultPlugin.name).toBe('@stone-js/i18n')
    expect(typeof defaultPlugin.onPrepare).toBe('function')
  })
})
