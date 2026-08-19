import * as fs from 'fs'
import * as path from 'path'
import fsExtra from 'fs-extra'
import * as crypto from 'crypto'
import * as process from 'node:process'
import { isSSR,
  isCSR,
  isSSG,
  dirPath,
  getCache,
  cliVersion,
  setCache,
  isReactApp,
  isLazyViews,
  shouldBuild,
  getFileHash,
  defineBuilderConfig,
  isDeclarative,
  getEnvVariables,
  isTypescriptApp,
  getStoneBuilderConfig,
  inferRenderingStrategy,
  setupProcessSignalHandlers,
  getDefaultPublicEnvOptions,
  generatePublicEnvironmentsFile,
  declaresAppLevelDecorator, stripNonDeclarations } from '../src/utils'
import Dotenv from 'dotenv'
import { importModule } from '@stone-js/filesystem'
import { builder } from '../src/options/BuilderConfig'
import { IBlueprint, IncomingEvent } from '@stone-js/core'

// Temp directory to avoid polluting project
const TMP_DIR = path.resolve(__dirname, './.tmp-utils')

const CACHE_PATH = path.join(TMP_DIR, '.cache')

// Inject virtual basePath and buildPath for controlled test dir
vi.mock('@stone-js/filesystem', async (mod) => {
  const actual: any = await mod()
  return {
    ...actual,
    importModule: vi.fn(),
    basePath: (p: string) => path.resolve(__dirname, './.tmp-utils', p),
    buildPath: (p: string) => path.resolve(__dirname, './.tmp-utils', p),
    // The scan resolves paths internally, so pointing `basePath` at the temp dir is not enough:
    // it has to be given the absolute pattern, which it accepts.
    appModuleFiles: ({ pattern }: { pattern?: string } = {}) => actual.appModuleFiles({
      pattern: path.resolve(__dirname, './.tmp-utils', pattern ?? actual.DEFAULT_APP_MODULES_PATTERN)
    })
  }
})

vi.mock('deepmerge', async (mod) => {
  const actual: any = await mod()
  return {
    ...actual,
    default: vi.fn((...args) => actual.default(...args))
  }
})

// Helpers
function writeFile (filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf-8')
}

function readCacheFile (): Record<string, string> {
  return fsExtra.readJsonSync(CACHE_PATH, { throws: false }) ?? {}
}

// Helper to write test files
function writeTempFile (filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf-8')
}

function createFakeBlueprint (data: Record<string, any> = {}): IBlueprint {
  return {
    get: vi.fn((key, def) => data[key] ?? def),
    is: vi.fn((key, expected) => data[key] === expected)
  } as unknown as IBlueprint
}

function createFakeEvent (data: Record<string, any> = {}): IncomingEvent {
  return {
    is: vi.fn((key, expected) => data[key] === expected),
    get: vi.fn((key, def) => data[key] ?? def)
  } as unknown as IncomingEvent
}

beforeEach(() => {
  fs.rmSync(TMP_DIR, { recursive: true, force: true })
  fs.mkdirSync(TMP_DIR, { recursive: true })
})

afterEach(() => {
  fs.rmSync(TMP_DIR, { recursive: true, force: true })
})

describe('utils: dirPath', () => {
  it('should resolve a path relative to this module', () => {
    const expected = path.join(path.dirname(import.meta.url.replace('file://', '')), '../src')
    expect(dirPath()).toBe(expected)
  })
})

describe('utils: cliVersion', () => {
  it('reads the version from the package manifest shipped with the bundle', () => {
    // The banner's fallback: `stone init` has no project to read a version from, so the CLI's own
    // version (= the framework version, lockstep) is what the user must see.
    expect(cliVersion()).toMatch(/^\d+\.\d+\.\d+/)
  })
})

describe('utils: getFileHash', () => {
  it('should return the correct sha256 hash of a file', () => {
    const filePath = path.join(TMP_DIR, 'file.js')
    const content = 'console.log("Hello, Stone!");'
    writeTempFile(filePath, content)

    const hash = getFileHash(filePath)

    const expected = crypto.createHash('sha256').update(content).digest('hex')

    expect(hash).toBe(expected)
  })
})

describe('utils: defineBuilderConfig', () => {
  it('should return the config as-is', () => {
    const config: any = { foo: 'bar' }
    expect(defineBuilderConfig(config)).toBe(config)
  })
})

describe('utils: inferRenderingStrategy', () => {
  it('should detect CSR when only browser adapter is present', () => {
    const content = 'import \'@stone-js/browser-adapter\''
    expect(inferRenderingStrategy(content)).toBe('csr')
  })

  it('should detect SSR when browser and another adapter are present', () => {
    const content = `
      import '@stone-js/browser-adapter'
      import '@stone-js/another-adapter'
    `
    expect(inferRenderingStrategy(content)).toBe('ssr')
  })

  it('should return undefined when no adapters found', () => {
    const content = 'console.log("no adapter")'
    expect(inferRenderingStrategy(content)).toBeUndefined()
  })

  it('should detect SSR even with mixed quotes and spacing', () => {
    const content = `
      import "@stone-js/browser-adapter"
      import "@some-custom-adapter"
    `
    expect(inferRenderingStrategy(content)).toBe('ssr')
  })

  it('should detect CSR if only browser and no other adapter', () => {
    const content = `
      import '@stone-js/browser-adapter';
    `
    expect(inferRenderingStrategy(content)).toBe('csr')
  })
})

describe('utils: getCache', () => {
  it('should return empty object if .cache file does not exist', () => {
    expect(getCache()).toEqual({})
  })

  it('should return empty object if .cache file does not contain valid item', () => {
    writeFile(CACHE_PATH, '{invalid content')
    expect(getCache()).toEqual({})
  })

  it('should return parsed cache object when .cache file exists', () => {
    fsExtra.outputJsonSync(CACHE_PATH, { '/mock/file.ts': 'abc123' })
    expect(getCache()).toEqual({ '/mock/file.ts': 'abc123' })
  })
})

describe('utils: setCache', () => {
  it('should write hashes of matched files to .cache', () => {
    const filePath = path.join(TMP_DIR, 'src/main.ts')
    writeFile(filePath, 'console.log("Hello")')

    setCache('**/*.ts')
    const hash = getFileHash(filePath)

    expect(readCacheFile()[filePath]).toBe(hash)
  })
})

describe('utils: shouldBuild', () => {
  it('should return true if no cache exists', () => {
    const filePath = path.join(TMP_DIR, 'x.ts')
    writeFile(filePath, 'hello')
    expect(shouldBuild('**/*.ts')).toBe(true)
  })

  it('should return false if file hash matches cache', () => {
    const filePath = path.join(TMP_DIR, 'x.ts')
    writeFile(filePath, 'same')

    setCache('**/*.ts')
    expect(shouldBuild('**/*.ts')).toBe(false)
  })

  it('should return true if file is new and not in cache', () => {
    const fileA = path.join(TMP_DIR, 'a.ts')
    const fileB = path.join(TMP_DIR, 'b.ts')

    writeFile(fileA, 'a')
    setCache('**/*.ts')

    writeFile(fileB, 'b')
    expect(shouldBuild('**/*.ts')).toBe(true)
  })

  it('should return true if file content has changed', () => {
    const filePath = path.join(TMP_DIR, 'main.ts')
    writeFile(filePath, 'original')

    setCache('**/*.ts')

    writeFile(filePath, 'modified')
    expect(shouldBuild('**/*.ts')).toBe(true)
  })
})

describe('utils: getEnvVariables', () => {
  const ENV_PATH = path.join(TMP_DIR, '.env.test')

  beforeEach(() => {
    /* eslint-disable-next-line no-template-curly-in-string */
    fs.writeFileSync(ENV_PATH, 'FOO=bar\nEXPAND=1\nNESTED=${FOO}', 'utf-8')
  })

  it('should load env variables with default behavior', () => {
    const env = getEnvVariables({ path: ENV_PATH })
    /* eslint-disable-next-line no-template-curly-in-string */
    expect(env).toMatchObject({ FOO: 'bar', EXPAND: '1', NESTED: '${FOO}' })
  })

  it('should expand variables if expand option is true', () => {
    const env = getEnvVariables({ path: ENV_PATH, expand: true })
    expect(env).toMatchObject({ FOO: 'bar', EXPAND: '1', NESTED: 'bar' })
  })

  it('should ignore process.env if ignoreProcessEnv is true', () => {
    const env = getEnvVariables({ path: ENV_PATH, ignoreProcessEnv: true })
    /* eslint-disable-next-line no-template-curly-in-string */
    expect(env).toMatchObject({ FOO: 'bar', EXPAND: '1', NESTED: '${FOO}' })
  })
})

describe('utils: getDefaultPublicEnvOptions', () => {
  beforeEach(() => {
    writeFile(path.join(TMP_DIR, '.env.public'), 'A=1')
    writeFile(path.join(TMP_DIR, '.env.public.dev'), 'B=2')
  })

  it('should return mapped .env.public and .env.public.* files', () => {
    const options = getDefaultPublicEnvOptions()
    expect(Object.keys(options)).toEqual(expect.arrayContaining(['default', 'dev']))
    expect(options.default.path).toContain('.env.public')
    expect(options.dev.path).toContain('.env.public.dev')
  })
})

describe('utils: generatePublicEnvironmentsFile', () => {
  const outputDir = path.join(TMP_DIR, 'env-output')
  const defaultEnv = path.join(TMP_DIR, '.env.public')
  const devEnv = path.join(TMP_DIR, '.env.public.dev')

  beforeEach(() => {
    fs.mkdirSync(outputDir, { recursive: true })
    writeFile(defaultEnv, 'X=1')
    writeFile(devEnv, 'Y=2')
  })

  const fakeBlueprint: IBlueprint = {
    get: vi.fn().mockImplementation(() => ({
      public: {
        default: { path: defaultEnv, default: true },
        dev: { path: devEnv }
      },
      options: {}
    }))
  } as unknown as IBlueprint

  it('should write environment files and return true if default exists', () => {
    const result = generatePublicEnvironmentsFile(fakeBlueprint, outputDir)

    const defaultFile = fs.readFileSync(path.join(outputDir, 'environments.js'), 'utf-8')
    const devFile = fs.readFileSync(path.join(outputDir, 'environments.dev.js'), 'utf-8')

    expect(defaultFile).toContain('window.process.env')
    expect(devFile).toContain('window.process.env')
    expect(result).toBe(true)
  })

  it('should return false if no default env is marked', () => {
    vi.spyOn(Dotenv, 'config').mockReturnValue({ parsed: undefined })
    fakeBlueprint.get = vi.fn().mockReturnValueOnce({
      public: {
        dev: { path: devEnv, default: false }
      }
    })

    const result = generatePublicEnvironmentsFile(fakeBlueprint, outputDir)
    expect(result).toBe(false)
  })

  it('should return true when default env is marked', () => {
    fakeBlueprint.get = vi.fn().mockReturnValueOnce({})

    const result = generatePublicEnvironmentsFile(fakeBlueprint, outputDir)
    expect(result).toBe(true)
  })

  it('should use fallback .env.public if path is undefined in config', () => {
    // Remove file path on purpose
    const noPathBlueprint: IBlueprint = {
      get: vi.fn().mockReturnValueOnce({
        public: {
          fallback: { default: true } // <-- no path
        },
        options: {}
      })
    } as unknown as IBlueprint

    // Create the fallback file manually
    const fallbackFile = path.join(TMP_DIR, '.env.public')
    writeFile(fallbackFile, 'FALLBACK_ENV=yes')

    const result = generatePublicEnvironmentsFile(noPathBlueprint, outputDir)

    expect(result).toBe(true)
    // expect(fallbackContent).toContain('FALLBACK_ENV')
  })

  it('should stringify empty env object if getEnvVariables returns undefined', () => {
    const noVarsBlueprint: IBlueprint = {
      get: vi.fn().mockReturnValueOnce({
        public: {
          empty: { default: true, path: path.join(TMP_DIR, 'missing.env') }
        },
        options: {}
      })
    } as unknown as IBlueprint

    const result = generatePublicEnvironmentsFile(noVarsBlueprint, outputDir)
    const content = fs.readFileSync(path.join(outputDir, 'environments.js'), 'utf-8')

    expect(result).toBe(true)
    expect(content).toContain('window.process.env')
    expect(content).toContain('{}')
  })
})

describe('utils: runtime detection', () => {
  it('should detect TypeScript via blueprint language', () => {
    const blueprint = createFakeBlueprint({ 'stone.builder.language': 'typescript' })
    const event = createFakeEvent()
    expect(isTypescriptApp(blueprint, event)).toBe(true)
  })

  it('should detect TypeScript via event language', () => {
    const blueprint = createFakeBlueprint()
    const event = createFakeEvent({ language: 'typescript' })
    expect(isTypescriptApp(blueprint, event)).toBe(true)
  })

  it('should fallback to file scan for TypeScript', () => {
    const file = path.join(TMP_DIR, 'ssr.ts')
    writeFile(file, 'import \'@stone-js/browser-adapter\'; import \'@stone-js/node-http-adapter\'')
    const blueprint = createFakeBlueprint({ 'stone.builder.input.all': '*.ts' })
    const event = createFakeEvent()
    expect(isTypescriptApp(blueprint, event)).toBe(true)
  })

  it('should detect React via blueprint target', () => {
    const blueprint = createFakeBlueprint({ 'stone.builder.target': 'react' })
    const event = createFakeEvent()
    expect(isReactApp(blueprint, event)).toBe(true)
  })

  it('should detect React via event target', () => {
    const blueprint = createFakeBlueprint()
    const event = createFakeEvent({ target: 'react' })
    expect(isReactApp(blueprint, event)).toBe(true)
  })

  it('should fallback to file scan for React', () => {
    const file = path.join(TMP_DIR, 'ssr.tsx')
    writeFile(file, 'import \'@stone-js/browser-adapter\'; import \'@stone-js/node-http-adapter\'')
    const blueprint = createFakeBlueprint({ 'stone.builder.input.views': '*.tsx' })
    const event = createFakeEvent()
    expect(isReactApp(blueprint, event)).toBe(true)
  })

  it('should detect CSR via rendering event override', () => {
    const blueprint = createFakeBlueprint()
    const event = createFakeEvent({ rendering: 'csr' })
    expect(isCSR(blueprint, event)).toBe(true)
  })

  it('should detect CSR via rendering blueprint config', () => {
    const blueprint = createFakeBlueprint({ 'stone.builder.rendering': 'csr' })
    const event = createFakeEvent()
    expect(isCSR(blueprint, event)).toBe(true)
  })

  it('should detect SSR via rendering blueprint override', () => {
    const blueprint = createFakeBlueprint({ 'stone.builder.rendering': 'ssr' })
    const event = createFakeEvent()
    expect(isSSR(blueprint, event)).toBe(true)
  })

  it('should detect SSR via rendering event', () => {
    const blueprint = createFakeBlueprint()
    const event = createFakeEvent({ rendering: 'ssr' })
    expect(isSSR(blueprint, event)).toBe(true)
  })

  it('should detect SSG via the --ssg flag', () => {
    expect(isSSG(createFakeBlueprint(), createFakeEvent({ ssg: true }))).toBe(true)
  })

  it('should detect SSG via rendering event', () => {
    expect(isSSG(createFakeBlueprint(), createFakeEvent({ rendering: 'ssg' }))).toBe(true)
    expect(isSSG(createFakeBlueprint(), createFakeEvent({ rendering: 'csr' }))).toBe(false)
  })

  it('should detect SSG via rendering blueprint config', () => {
    expect(isSSG(createFakeBlueprint({ 'stone.builder.rendering': 'ssg' }), createFakeEvent())).toBe(true)
    expect(isSSG(createFakeBlueprint(), createFakeEvent())).toBe(false)
  })

  it('should detect lazy views if file content includes router signature', () => {
    const file = path.join(TMP_DIR, 'lazy.tsx')
    writeFile(file, 'import \'@stone-js/router\'; const r = @Routing')
    const blueprint = createFakeBlueprint({ 'stone.builder.input.all': '*.tsx' })
    const event = createFakeEvent()
    expect(isLazyViews(blueprint, event)).toBe(true)
  })

  it('should return true if event explicitly sets lazy to true', () => {
    const event = createFakeEvent({ lazy: true })
    event.is = vi.fn((key, val) => key === 'lazy' && val === true)

    const blueprint = createFakeBlueprint()
    blueprint.is = vi.fn(() => true) // Bypass undefined check

    expect(isLazyViews(blueprint, event)).toBe(true)
  })

  it('should return true if blueprint explicitly sets lazy to true', () => {
    const blueprint = createFakeBlueprint({ 'stone.builder.lazy': true })
    blueprint.is = vi.fn((key, val) => key === 'stone.builder.lazy' && val === true)

    const event = createFakeEvent()
    event.is = vi.fn(() => true) // Bypass undefined check

    expect(isLazyViews(blueprint, event)).toBe(true)
  })

  it('should return true if file contains @stone-js/router and @Routing or routerBlueprint', () => {
    const file = path.join(TMP_DIR, 'lazy.tsx')
    writeFile(file, 'import { Routing } from \'@stone-js/router\'; const r = @Routing')
    const blueprint = createFakeBlueprint({ 'stone.builder.input.all': '*.tsx' })
    const event = createFakeEvent()

    expect(isLazyViews(blueprint, event)).toBe(true)

    const file2 = path.join(TMP_DIR, 'lazy2.tsx')
    writeFile(file2, 'import { routerBlueprint } from \'@stone-js/router\'')
    expect(isLazyViews(blueprint, event)).toBe(true)
  })

  it('should detect declarative mode if file content includes @StoneApp', () => {
    const file = path.join(TMP_DIR, 'decl.tsx')
    writeFile(file, 'import \'@stone-js/core\'; const App = @StoneApp')
    const blueprint = createFakeBlueprint({ 'stone.builder.input.all': '*.tsx' })
    const event = createFakeEvent()
    expect(isDeclarative(blueprint, event)).toBe(true)
  })

  it('should return true if event explicitly says imperative is false', () => {
    const blueprint = createFakeBlueprint()
    const event = createFakeEvent()
    event.is = vi.fn((key, value) => key === 'imperative' && value === false)
    expect(isDeclarative(blueprint, event)).toBe(true)

    // Covers: if (!event.is('imperative', undefined)) ...
  })

  it('should return true if blueprint explicitly sets imperative to false', () => {
    const blueprint = createFakeBlueprint({ 'stone.builder.imperative': false })
    blueprint.is = vi.fn((key, value) => key === 'stone.builder.imperative' && value === false)

    const event = createFakeEvent()
    event.is = vi.fn(() => true) // Simulate undefined check

    expect(isDeclarative(blueprint, event)).toBe(true)

    // Covers: if (!blueprint.is('stone.builder.imperative', undefined)) ...
  })

  it('should fallback to file scan for CSR if no config or override', () => {
    const file = path.join(TMP_DIR, 'csr.tsx')
    writeFile(file, 'import \'@stone-js/browser-adapter\'')
    const blueprint = createFakeBlueprint({ 'stone.builder.input.all': '*.tsx' })
    const event = createFakeEvent()
    expect(isCSR(blueprint, event)).toBe(true)
  })

  it('should fallback to file scan for SSR if mixed adapters present', () => {
    const file = path.join(TMP_DIR, 'ssr.tsx')
    writeFile(file, 'import \'@stone-js/browser-adapter\'; import \'@stone-js/node-http-adapter\'')
    const blueprint = createFakeBlueprint({ 'stone.builder.input.all': '*.tsx' })
    const event = createFakeEvent()
    expect(isSSR(blueprint, event)).toBe(true)
  })
})

describe('getStoneBuilderConfig', () => {
  it('should return merged config when stone.config file is found and valid', async () => {
    const mockConfig = { custom: true }
    vi.mocked(importModule).mockResolvedValue({ default: mockConfig })

    const result = await getStoneBuilderConfig()

    expect(result).toEqual(expect.objectContaining({
      ...builder,
      ...mockConfig
    }))
  })

  it('should return default builder if no config is found', async () => {
    vi.mocked(importModule).mockResolvedValue(undefined)

    const result = await getStoneBuilderConfig()

    expect(result).toEqual(builder)
  })
})

describe('setupProcessSignalHandlers', () => {
  it('should read the current process from the getter at signal time (not capture undefined)', () => {
    const serverProcess: any = { kill: vi.fn() }
    // The child is spawned AFTER wiring the handlers: the getter must see the eventual value.
    let current: any
    setupProcessSignalHandlers(() => current)
    current = serverProcess

    process.emit('SIGINT')

    expect(serverProcess.kill).toHaveBeenCalledWith('SIGTERM')
  })

  it('should be a no-op when no process is present', () => {
    setupProcessSignalHandlers(() => undefined)
    expect(() => process.emit('SIGTERM')).not.toThrow()
  })
})

describe('declaresAppLevelDecorator', () => {
  it('finds a declaration where one can actually appear', () => {
    expect(declaresAppLevelDecorator('@StoneApp({ name: \'x\' })\nexport class Application {}')).toBe(true)
    expect(declaresAppLevelDecorator('  @Configuration()\n  export class C {}')).toBe(true)
    expect(declaresAppLevelDecorator('@Provider()\nexport class P {}')).toBe(true)
  })

  it('ignores a name that is only mentioned', () => {
    // This is the whole correction. Scanning raw text flagged 51 of this repository's own website
    // files, none of which declares anything: a docs page renders `@StoneApp` inside a code sample,
    // and a JSDoc block refers to `@Configuration` in prose. Failing those builds would be wrong.
    expect(declaresAppLevelDecorator('// registered via @Provider elsewhere')).toBe(false)
    expect(declaresAppLevelDecorator('/**\n * See @Configuration for options.\n */')).toBe(false)
    expect(declaresAppLevelDecorator('export const D = () => <code>@UseReact</code>')).toBe(false)
    expect(declaresAppLevelDecorator('const S = `@StoneApp({ name: 1 })\nexport class A {}`')).toBe(false)
  })

  it('ignores decorators that are not app-level', () => {
    expect(declaresAppLevelDecorator('@Page(\'/home\')\nexport class Home {}')).toBe(false)
    expect(declaresAppLevelDecorator('@EventHandler(\'/x\')\nexport class H {}')).toBe(false)
  })
})

describe('stripNonDeclarations', () => {
  it('blanks mentions while keeping the line structure, so line numbers stay true', () => {
    const stripped = stripNonDeclarations('a\n// @StoneApp\nb\n/* @Provider */\nc')

    expect(stripped.split('\n')).toHaveLength(5)
    expect(stripped).not.toContain('@StoneApp')
    expect(stripped).not.toContain('@Provider')
    expect(stripped).toContain('a')
    expect(stripped).toContain('c')
  })
})
