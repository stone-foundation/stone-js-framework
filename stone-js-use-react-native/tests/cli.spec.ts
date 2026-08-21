import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { withStone, writeManifest } from '../src/metro'
import plugin, { NATIVE_TARGET, SetNativeBuilderMiddleware, isNativeApp, nativeBuilderDefinition, reactNativeCliPlugin } from '../src/cli'

const makeProject = (files: Record<string, string>): string => {
  const root = mkdtempSync(join(tmpdir(), 'stone-native-cli-'))

  for (const [file, content] of Object.entries(files)) {
    writeFileSync(join(root, file), content, 'utf-8')
  }

  return root
}

describe('isNativeApp', () => {
  const roots: string[] = []

  afterEach(() => {
    roots.forEach((root) => rmSync(root, { recursive: true, force: true }))
    roots.length = 0
  })

  const project = (files: Record<string, string>): string => {
    const root = makeProject(files)
    roots.push(root)
    return root
  }

  it.each([
    'app.json',
    'app.config.js',
    'app.config.ts',
    'app.config.mjs'
  ])('recognises a project by its %s', (file) => {
    expect(isNativeApp(project({ [file]: '{}' }))).toBe(true)
  })

  it('does not claim a project that is not a native one', () => {
    expect(isNativeApp(project({ 'package.json': '{}' }))).toBe(false)
  })
})

describe('The native build target', () => {
  it('is checked before the React one, because a native project also has views', () => {
    // The React target detects `app/**/*.tsx`, which a native application has too, so the more
    // specific question has to be asked first. Priorities are what order them.
    expect(nativeBuilderDefinition.priority).toBeLessThan(10)
  })

  it('lets Expo own its dev server, and launches nothing itself', () => {
    expect(nativeBuilderDefinition.devMode).toBe('self-hosted')
    expect(nativeBuilderDefinition.devEntry).toBeUndefined()
  })

  it('has nothing to preview from Node, and says so by declaring nothing', () => {
    expect(nativeBuilderDefinition.previewEntry).toBeUndefined()
  })

  it('builds a builder for the run', () => {
    const context: any = { blueprint: { get: vi.fn() }, commandOutput: { info: vi.fn() } }

    expect(nativeBuilderDefinition.resolver(context)).toBeTruthy()
  })
})

describe('The CLI plugin', () => {
  it('registers the target before any command runs', async () => {
    const set = vi.fn()
    const next = vi.fn(async (context: any) => context.blueprint)
    const context: any = { blueprint: { set } }

    await SetNativeBuilderMiddleware(context, next as any)

    expect(set).toHaveBeenCalledWith(`stone.builder.builders.${NATIVE_TARGET}`, nativeBuilderDefinition)
    expect(next).toHaveBeenCalled()
  })

  it('is exported as a default instance, which is what auto-discovery reads', () => {
    expect(plugin.name).toBe('@stone-js/use-react-native')
    expect(plugin.blueprintMiddleware).toHaveLength(1)
  })

  it('is also available as a factory, for an explicit registration', () => {
    expect(reactNativeCliPlugin().name).toBe(plugin.name)
  })
})

describe('withStone', () => {
  const roots: string[] = []

  afterEach(() => {
    roots.forEach((root) => rmSync(root, { recursive: true, force: true }))
    roots.length = 0
    vi.restoreAllMocks()
  })

  const project = (): string => {
    const root = mkdtempSync(join(tmpdir(), 'stone-native-metro-'))
    roots.push(root)
    return root
  }

  it('collects the modules and hands the configuration back untouched', () => {
    const root = project()
    writeFileSync(join(root, 'app.json'), '{}', 'utf-8')
    const config = { watchFolders: [], transformer: { some: 'setting' } }
    vi.spyOn(console, 'log').mockImplementation(() => {})

    const result = withStone(config, { projectRoot: root })

    expect(result).toBe(config)
    expect(readFileSync(join(root, '.stone', 'modules.ts'), 'utf-8')).toContain('export const modules')
  })

  it('re-exports the generator, so a type-check can produce the manifest without Metro', () => {
    // `tsc --noEmit` on a fresh clone reads the entry's `./.stone/modules` import before Metro has
    // ever run. Reaching the generator has to be possible without starting a bundler.
    const root = project()

    const result = writeManifest(root)

    expect(readFileSync(join(root, '.stone', 'modules.ts'), 'utf-8')).toContain('export const modules')
    expect(result.changed).toBe(true)
  })

  it('takes the project root as a shorthand, which is how metro.config.js reads best', () => {
    const root = project()
    vi.spyOn(console, 'log').mockImplementation(() => {})

    withStone({}, root)

    expect(readFileSync(join(root, '.stone', 'modules.ts'), 'utf-8')).toContain('export const modules')
  })

  it('says how many modules it collected, so a silent generation is never a mystery', () => {
    const root = project()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    withStone({}, { projectRoot: root })

    expect(log).toHaveBeenCalledWith(expect.stringContaining('0 modules collected'))
  })

  it('keeps quiet when asked to', () => {
    const root = project()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    withStone({}, { projectRoot: root, verbose: false })

    expect(log).not.toHaveBeenCalled()
  })

  it('falls back to the current directory, which is Metro\'s own root', () => {
    const root = project()
    const cwd = process.cwd()
    vi.spyOn(console, 'log').mockImplementation(() => {})

    try {
      process.chdir(root)
      withStone({})
    } finally {
      process.chdir(cwd)
    }

    expect(readFileSync(join(root, '.stone', 'modules.ts'), 'utf-8')).toContain('export const modules')
  })

  it('counts one module in the singular', () => {
    const root = project()
    mkdirSync(join(root, 'app'), { recursive: true })
    writeFileSync(join(root, 'app', 'Application.ts'), 'export const x = 1\n', 'utf-8')
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    withStone({}, root)

    expect(log).toHaveBeenCalledWith(expect.stringContaining('1 module collected'))
  })

  it('says when nothing changed, so a rebuild that did nothing looks like it', () => {
    const root = project()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    withStone({}, root)
    withStone({}, root)

    expect(log).toHaveBeenLastCalledWith(expect.stringContaining('(unchanged)'))
  })
})
