import defaultPlugin, {
  i18nCliPlugin,
  localeOf,
  toImportSpecifier,
  generateI18nModule,
  scanTranslationFiles,
  findTranslationDirs,
  collectTranslationFiles,
  resolveTranslationFiles,
  toSafeJsStringLiteral,
  GENERATED_MODULE,
  DEFAULT_I18N_DIR,
  DEFAULT_I18N_ROOT,
  DEFAULT_I18N_DIRNAME
} from '../src/cli'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn()
}))

vi.mock('glob', () => ({ globSync: vi.fn(() => []) }))

import { globSync } from 'glob'
import { existsSync, readdirSync, statSync } from 'node:fs'

const APP = `/proj/${DEFAULT_I18N_ROOT}`
const ROOT = `/proj/${DEFAULT_I18N_DIR}`                 // app/i18n, the conventional catalogue
const MODULE_ROOT = `${APP}/modules/billing/i18n`         // a catalogue next to the code that uses it

// A realistic nested layout: a shared catalogue plus one per module, which is how a large app groups
// translations. Both are found by the walk, at any depth.
const DIRS = new Set([
  APP, `${APP}/modules`, `${APP}/modules/billing`, `${APP}/node_modules`, `${APP}/.cache`,
  ROOT, `${ROOT}/en`, `${ROOT}/fr`,
  MODULE_ROOT, `${MODULE_ROOT}/fr`
])
const ENTRIES: Record<string, string[]> = {
  [APP]: ['i18n', 'modules', 'node_modules', '.cache', 'Application.ts'],
  [`${APP}/modules`]: ['billing'],
  [`${APP}/modules/billing`]: ['i18n', 'BillingService.ts'],
  [`${APP}/node_modules`]: ['i18n'],                     // must be ignored
  [`${APP}/.cache`]: ['i18n'],                           // must be ignored
  [ROOT]: ['en', 'fr', 'README.md'],                     // README.md at locale level is skipped (not a dir)
  [`${ROOT}/en`]: ['common.json', 'auth.json', 'notes.txt'], // notes.txt (unlisted ext) skipped
  [`${ROOT}/fr`]: ['common.json'],
  [MODULE_ROOT]: ['fr'],
  [`${MODULE_ROOT}/fr`]: ['invoice.json']
}
const FILES = new Set([
  `${ROOT}/en/common.json`, `${ROOT}/en/auth.json`, `${ROOT}/fr/common.json`, `${ROOT}/en/notes.txt`,
  `${MODULE_ROOT}/fr/invoice.json`
])

function mountFs (): void {
  vi.mocked(existsSync).mockImplementation((p) => DIRS.has(p as string))
  vi.mocked(readdirSync).mockImplementation((p, options?: any) => {
    const names = ENTRIES[p as string] ?? []
    // The deep walk asks for dirents; the per-locale scan asks for names.
    return (options?.withFileTypes === true
      ? names.map((name) => ({ name, isDirectory: () => DIRS.has(`${String(p)}/${name}`) }))
      : names) as any
  })
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

describe('findTranslationDirs', () => {
  beforeEach(() => { vi.clearAllMocks(); mountFs() })

  it('finds every catalogue under the root, at any depth', () => {
    // What lets a project group translations with the code that uses them, instead of forcing one
    // flat directory: a shared catalogue plus one per module.
    expect(findTranslationDirs(APP)).toEqual([ROOT, MODULE_ROOT])
  })

  it('ignores node_modules and dotted directories', () => {
    expect(findTranslationDirs(APP)).not.toContain(`${APP}/node_modules/i18n`)
    expect(findTranslationDirs(APP)).not.toContain(`${APP}/.cache/i18n`)
  })

  it('does not descend into a catalogue it already found', () => {
    // A locale directory is not another catalogue, so the walk stops there.
    expect(findTranslationDirs(APP)).not.toContain(`${ROOT}/en`)
  })

  it('honours a custom directory name, and copes with an absent root', () => {
    expect(findTranslationDirs(APP, 'modules')).toEqual([`${APP}/modules`])
    expect(findTranslationDirs('/nowhere')).toEqual([])
  })
})

describe('collectTranslationFiles', () => {
  beforeEach(() => { vi.clearAllMocks(); mountFs() })

  it('collects the files of every catalogue, sorted and de-duplicated', () => {
    expect(collectTranslationFiles(APP, ['json'])).toEqual([
      `${ROOT}/en/auth.json`,
      `${ROOT}/en/common.json`,
      `${ROOT}/fr/common.json`,
      `${MODULE_ROOT}/fr/invoice.json`
    ].sort((a, b) => a.localeCompare(b)))
  })
})

describe('resolveTranslationFiles', () => {
  beforeEach(() => { vi.clearAllMocks(); mountFs() })

  const base = { root: DEFAULT_I18N_ROOT, dirname: DEFAULT_I18N_DIRNAME }

  it('walks the root by default', () => {
    const files = resolveTranslationFiles('/proj', base, ['json'])
    expect(files).toContain(`${ROOT}/en/common.json`)
    expect(files).toContain(`${MODULE_ROOT}/fr/invoice.json`)
  })

  it('scans one explicit directory when `dir` is given', () => {
    const files = resolveTranslationFiles('/proj', { ...base, dir: DEFAULT_I18N_DIR }, ['json'])
    expect(files).toEqual([
      `${ROOT}/en/auth.json`, `${ROOT}/en/common.json`, `${ROOT}/fr/common.json`
    ])
    expect(files).not.toContain(`${MODULE_ROOT}/fr/invoice.json`)
  })

  it('takes a glob when `pattern` is given, filtered by extension', () => {
    vi.mocked(globSync).mockReturnValue([
      `${ROOT}/fr/common.json`, `${ROOT}/en/common.json`, `${ROOT}/en/notes.txt`
    ] as any)

    const files = resolveTranslationFiles('/proj', { ...base, pattern: 'app/**/locales/*/*.json' }, ['json'])

    // A dependency's catalogues are never the app's, whatever the glob matches.
    expect(globSync).toHaveBeenCalledWith('app/**/locales/*/*.json', expect.objectContaining({
      cwd: '/proj', nodir: true, ignore: expect.arrayContaining(['**/node_modules/**'])
    }))
    expect(files).toEqual([`${ROOT}/en/common.json`, `${ROOT}/fr/common.json`])
  })
})

describe('i18nCliPlugin', () => {
  const cwd = vi.spyOn(process, 'cwd').mockReturnValue('/proj')

  const makeContext = (): { writeFile: any, addModule: any, buildPath: any, reporter: any } => ({
    writeFile: vi.fn(),
    addModule: vi.fn(),
    // The real context always carries one, and the plugin now says what it found through it.
    reporter: { step: vi.fn() },
    buildPath: (rel: string) => `/proj/.stone/tmp/${rel}`
  })

  beforeEach(() => { vi.clearAllMocks(); cwd.mockReturnValue('/proj'); mountFs() })

  it('is a Stone CLI plugin with an onPrepare hook and no legacy blueprint middleware', () => {
    const plugin = i18nCliPlugin()
    expect(plugin.name).toBe('@stone-js/i18n')
    // The description advertises the walk, not a single directory, so `stone plugins` tells the truth.
    expect(plugin.description).toContain(`${DEFAULT_I18N_ROOT}/**/${DEFAULT_I18N_DIRNAME}`)
    expect(i18nCliPlugin({ dir: 'locales' }).description).toContain('locales')
    expect(i18nCliPlugin({ pattern: 'src/**/*.json' }).description).toContain('src/**/*.json')
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

describe('the locales the scan found', () => {
  const files = ['/app/i18n/en/common.json', '/app/i18n/en/errors.json', '/app/i18n/fr/common.json']

  it('states them in the generated module, both eager and lazy', () => {
    // Discovering them and keeping quiet was a feature that never ran: content negotiation is skipped
    // entirely when `stone.i18n.locales` is empty, so every caller got the fallback locale whatever
    // they asked for. Under lazy loading that is how an application answers raw keys, since only the
    // resolved locale is fetched and the resolved locale was never the caller's.
    expect(generateI18nModule('/build', files, true)).toContain('locales: ["en","fr"]')
    expect(generateI18nModule('/build', files, false)).toContain('locales: ["en","fr"]')
  })

  it('reads a locale from the directory that holds the catalog', () => {
    expect(localeOf('/app/i18n/fr/common.json')).toBe('fr')
    expect(localeOf('C:\\app\\i18n\\pt-BR\\common.json')).toBe('pt-BR')
  })

  it('says nothing when there is nothing to say', () => {
    expect(generateI18nModule('/build', [], true)).toContain('locales: []')
  })
})

describe('saying what the scan found', () => {
  const contextWith = (): any => ({
    buildPath: (file: string) => `/build/${file}`,
    writeFile: vi.fn(),
    addModule: vi.fn(),
    reporter: { step: vi.fn() }
  })

  it('reports the catalogs and locales it registered', () => {
    // The alternative is grepping a bundle, which is what an application had to do to find out
    // whether translations had been registered at all.
    vi.mocked(globSync).mockReturnValue(['/app/i18n/fr/errors.json', '/app/i18n/en/errors.json'] as any)
    const context = contextWith()

    i18nCliPlugin({ pattern: 'app/**/i18n' }).onPrepare?.(context)

    expect(context.reporter.step).toHaveBeenCalledWith('i18n: 2 catalog(s), 2 locale(s) (en, fr)')
  })

  it('says so when it found none, instead of registering nothing quietly', () => {
    // A module with no catalogs answers every key with itself, which reads like a missing entry and
    // ships to production in the user's language.
    vi.mocked(globSync).mockReturnValue([] as any)
    const context = contextWith()

    i18nCliPlugin({ pattern: 'app/**/i18n' }).onPrepare?.(context)

    expect(context.reporter.step).toHaveBeenCalledWith(expect.stringContaining('no catalog found'))
  })
})
