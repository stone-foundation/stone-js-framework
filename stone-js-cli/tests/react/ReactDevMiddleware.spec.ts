import fsExtra from 'fs-extra'
import { build as viteBuild } from 'vite'
import { generatePublicEnvironmentsFile, isTypescriptApp, setCache } from '../../src/utils'
import { reactClientEntryPointTemplate, reactConsoleEntryPointTemplate } from '../../src/react/stubs'
import { GenerateEntryPointFileMiddleware, BuildConsoleAppMiddleware, GenerateDevHtmlTemplateFileMiddleware, GenerateDevServerMiddleware, GeneratePublicEnvFileDevMiddleware, GenerateReactConsoleFileMiddleware } from '../../src/react/ReactDevMiddleware'

const { outputFileSync, existsSync, readFileSync } = fsExtra

vi.mock('fs-extra', async () => {
  return {
    default: {
      outputFileSync: vi.fn(),
      existsSync: vi.fn(),
      readFileSync: vi.fn()
    }
  }
})

vi.mock('@stone-js/filesystem', async () => ({
  basePath: vi.fn((p?: string) => `/base/${p ?? ''}`),
  buildPath: vi.fn((p?: string) => `/build/${p ?? ''}`)
}))

vi.mock('../../src/react/stubs', async () => ({
  reactClientEntryPointTemplate: vi.fn().mockReturnValue('// client'),
  reactHtmlEntryPointTemplate: vi.fn().mockReturnValue('<html><!--main-js--><!--main-css--></html>'),
  reactConsoleEntryPointTemplate: vi.fn().mockReturnValue('// console'),
  viteDevServerTemplate: vi.fn().mockReturnValue('// server')
}))

vi.mock('../../src/utils', async () => ({
  isTypescriptApp: vi.fn().mockReturnValue(true),
  generatePublicEnvironmentsFile: vi.fn().mockReturnValue(true),
  setCache: vi.fn()
}))

vi.mock('../../src/react/react-utils', async () => ({
  getViteConfig: vi.fn().mockResolvedValue({ test: true })
}))

vi.mock('vite', async () => ({
  build: vi.fn(),
  mergeConfig: vi.fn((a, b) => ({ ...a, ...b }))
}))

const createContext = (blueprintValues: any = {}): any => ({
  blueprint: {
    get: vi.fn((key, fallback) => blueprintValues[key] ?? fallback),
    setIf: vi.fn()
  },
  event: {}
})

const next = vi.fn(async (ctx) => ctx)

describe('ReactDevMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(isTypescriptApp).mockReturnValue(true)
  })

  it('should run GenerateEntryPointFileMiddleware', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    const context: any = createContext({ 'stone.builder.input.all': 'app/**/*' })

    await GenerateEntryPointFileMiddleware(context, next)

    expect(reactClientEntryPointTemplate).toHaveBeenCalled()
    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/index.ts',
      expect.stringContaining('// client'),
      'utf-8'
    )
    expect(next).toHaveBeenCalled()
  })

  it('should run GenerateEntryPointFileMiddleware for JavaScript', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(isTypescriptApp).mockReturnValue(false)
    vi.mocked(readFileSync).mockReturnValue('// User file content')

    const context: any = createContext({ 'stone.builder.input.all': 'app/**/*' })

    await GenerateEntryPointFileMiddleware(context, next)

    expect(readFileSync).toHaveBeenCalled()
    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/index.mjs',
      expect.stringContaining('// User file content'),
      'utf-8'
    )
    expect(next).toHaveBeenCalled()
  })

  it('should run GenerateDevHtmlTemplateFileMiddleware', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    const context: any = createContext({ 'stone.builder.input.mainCSS': '/assets/css/index.css' })

    await GenerateDevHtmlTemplateFileMiddleware(context, next)

    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/index.html',
      expect.stringContaining('<html>'),
      'utf-8'
    )
  })

  it('should run GenerateDevHtmlTemplateFileMiddleware for JavaScript', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(isTypescriptApp).mockReturnValue(false)
    vi.mocked(readFileSync).mockReturnValue('// User file content')

    const context: any = createContext({ 'stone.builder.input.mainCSS': '/assets/css/index.css' })

    await GenerateDevHtmlTemplateFileMiddleware(context, next)

    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/index.html',
      expect.stringContaining('// User file content'),
      'utf-8'
    )
  })

  it('should run GeneratePublicEnvFileDevMiddleware', async () => {
    vi.mocked(readFileSync).mockReturnValue('<html><!--env-js--></html>')

    const context: any = createContext()

    await GeneratePublicEnvFileDevMiddleware(context, next)

    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/index.html',
      expect.stringContaining('<script src="environments.js"></script>'),
      'utf-8'
    )
  })

  it('should run GeneratePublicEnvFileDevMiddleware when no env is defined', async () => {
    vi.mocked(readFileSync).mockReturnValue('<html><!--env-js--></html>')
    vi.mocked(generatePublicEnvironmentsFile).mockReturnValue(false)

    const context: any = createContext()

    await GeneratePublicEnvFileDevMiddleware(context, next)

    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/index.html',
      expect.stringContaining('<html></html>'),
      'utf-8'
    )
  })

  it('should run GenerateDevServerMiddleware', async () => {
    const context: any = createContext()

    await GenerateDevServerMiddleware(context, next)

    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/server.mjs',
      '// server',
      'utf-8'
    )
  })

  it('should run GenerateReactConsoleFileMiddleware', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    const context: any = createContext({ 'stone.builder.input.all': 'app/**/*' })

    await GenerateReactConsoleFileMiddleware(context, next)

    expect(reactConsoleEntryPointTemplate).toHaveBeenCalled()
    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/index.console.ts',
      expect.stringContaining('// console'),
      'utf-8'
    )
    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/template.mjs',
      'export const template = ""',
      'utf-8'
    )
  })

  it('should run GenerateReactConsoleFileMiddleware for JavaScript', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(isTypescriptApp).mockReturnValue(false)
    vi.mocked(readFileSync).mockReturnValue('// User file content')

    const context: any = createContext({ 'stone.builder.input.all': 'app/**/*' })

    await GenerateReactConsoleFileMiddleware(context, next)

    expect(readFileSync).toHaveBeenCalled()
    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/index.console.mjs',
      expect.stringContaining('// User file content'),
      'utf-8'
    )
    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/template.mjs',
      'export const template = ""',
      'utf-8'
    )
  })

  it('should run BuildConsoleAppMiddleware for TypeScript', async () => {
    const context: any = createContext({ 'stone.builder.input.all': 'app/**/*' })

    await BuildConsoleAppMiddleware(context, next)

    const config: any = vi.mocked(viteBuild).mock.calls[0][0]
    expect(config.build.ssr).toBe('/build/index.console.ts')
    expect(setCache).toHaveBeenCalledWith('app/**/*')
  })

  it('should run BuildConsoleAppMiddleware for JavaScript', async () => {
    vi.mocked(isTypescriptApp).mockReturnValue(false)
    const context: any = createContext({ 'stone.builder.input.all': 'app/**/*' })

    await BuildConsoleAppMiddleware(context, next)

    const config: any = vi.mocked(viteBuild).mock.calls[0][0]
    expect(config.build.ssr).toBe('/build/index.console.mjs')
    expect(setCache).toHaveBeenCalledWith('app/**/*')
  })
})
