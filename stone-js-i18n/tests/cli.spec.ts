import defaultPlugin, {
  i18nCliPlugin,
  toImportSpecifier,
  generateI18nModule,
  scanTranslationFiles,
  toSafeJsStringLiteral,
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

describe('toSafeJsStringLiteral', () => {
  it('escapes the characters that could break out of the generated source', () => {
    expect(toSafeJsStringLiteral('a/b')).toBe('"a\\u002Fb"')
    expect(toSafeJsStringLiteral('</script>')).toBe('"\\u003C\\u002Fscript\\u003E"')
  })

  it('never leaves a raw angle bracket or slash in the output', () => {
    const out = toSafeJsStringLiteral('</x>/y')
    expect(out).not.toContain('<')
    expect(out).not.toContain('>')
    expect(out).not.toContain('/')
  })
})

describe('generateI18nModule', () => {
  const moduleDir = '/proj/.stone/tmp/plugins'
  const files = [`${ROOT}/en/common.json`, `${ROOT}/fr/common.json`]

  it('emits eager static imports handed to loadTranslations, with escaped specifiers', () => {
    const source = generateI18nModule(moduleDir, files, false)
    expect(source).toContain("import { loadTranslations } from '@stone-js/i18n'")
    expect(source).toContain('import * as __i18n0 from ')
    expect(source).toContain('loadTranslations({')
    expect(source).toContain('common.json')     // filename tail survives
    expect(source).toContain('\\u002F')          // path separators are escaped
    expect(source).not.toContain('import.meta.glob')
  })

  it('emits lazy per-file dynamic importers as loaders', () => {
    const source = generateI18nModule(moduleDir, files, true)
    expect(source).toContain('loaders: {')
    expect(source).toContain('() => import(')
    expect(source).not.toContain('loadTranslations')
  })

  it('emits a `stone`-wrapped blueprint the module scan actually applies', () => {
    // It used to emit `defineConfig(defineI18n({...}))`, which silently did NOTHING: `defineI18n`
    // returns an unwrapped `{ i18n }` fragment while `defineConfig` expects a function or an object
    // carrying `configure`, so `configure` resolved to a no-op and no catalogue ever reached the
    // blueprint. Every translation returned its key, reading exactly like a missing catalogue.
    for (const lazy of [true, false]) {
      const source = generateI18nModule(moduleDir, files, lazy)
      expect(source).toContain('stone: {')
      expect(source).toContain('i18n: {')
      expect(source).not.toContain('defineConfig')
      expect(source).not.toContain('defineI18n')
    }
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

  it('generates lazy loaders by default and contributes the module to the app', () => {
    const context = makeContext()
    const plugin = i18nCliPlugin()
    plugin.onPrepare?.(context as any)

    expect(plugin.description).toContain('(lazy)')
    expect(context.writeFile).toHaveBeenCalledWith(GENERATED_MODULE, expect.stringContaining('() => import('))
    expect(context.writeFile).toHaveBeenCalledWith(GENERATED_MODULE, expect.stringContaining('common.json'))
    expect(context.addModule).toHaveBeenCalledWith(`./${GENERATED_MODULE}`)
  })

  it('generates eager imports when lazy is disabled', () => {
    const context = makeContext()
    const plugin = i18nCliPlugin({ lazy: false })
    plugin.onPrepare?.(context as any)

    expect(plugin.description).toContain('(eager)')
    expect(context.writeFile).toHaveBeenCalledWith(GENERATED_MODULE, expect.stringContaining('loadTranslations({'))
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
