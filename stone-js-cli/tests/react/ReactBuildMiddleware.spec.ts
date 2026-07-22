import * as vite from 'vite'
import fsExtra from 'fs-extra'
import * as globModule from 'glob'
import { existsSync } from 'node:fs'
import {
  BuildViewsMiddleware,
  BuildClientAppMiddleware,
  GenerateLazyPageMiddleware,
  BuildReactCleaningMiddleware,
  GenerateClientFileMiddleware,
  GenerateViewsIndexMiddleware,
  BuildReactServerAppMiddleware,
  GenerateIndexHtmlFileMiddleware,
  GeneratePublicEnvFileMiddleware,
  GenerateReactServerFileMiddleware
} from '../../src/react/ReactBuildMiddleware'
import { stoneCliBlueprint } from '../../src/options/StoneCliBlueprint'
import { generateImperativeLazyPages, generateDeclarativeLazyPages } from '../../src/react/react-utils'
import { generatePublicEnvironmentsFile, isDeclarative, isLazyViews, isTypescriptApp } from '../../src/utils'

const { outputFileSync, moveSync, removeSync, readFileSync } = fsExtra

vi.mock('./build/tmp/viewsIndex.mjs', async () => ({
  views: {
    'ViewA.tsx': {
      default: stoneCliBlueprint
    },
    'ViewB.tsx': {
      NamedExport: {}
    }
  }
}))

vi.mock('fs-extra', async () => {
  return {
    default: {
      outputFileSync: vi.fn(),
      existsSync: vi.fn(),
      moveSync: vi.fn(),
      removeSync: vi.fn(),
      readFileSync: vi.fn().mockReturnValue('HTML_CONTENT')
    }
  }
})

vi.mock('node:fs', async () => ({
  existsSync: vi.fn().mockReturnValue(false)
}))

vi.mock('node:path', async () => ({
  relative: vi.fn().mockImplementation((_from, to) => to)
}))

vi.mock('glob', () => ({ glob: { sync: vi.fn() } }))

vi.mock('vite', async () => {
  const viteActual = await vi.importActual<typeof import('vite')>('vite')
  return {
    ...viteActual,
    build: vi.fn(),
    mergeConfig: vi.fn((a, b) => ({ ...a, ...b }))
  }
})

vi.mock('@stone-js/filesystem', async () => ({
  buildPath: (p: string) => `./build/${p}`,
  basePath: (p: string) => `./base/${p}`,
  distPath: (p: string) => `./dist/${p ?? ''}`
}))

vi.mock('../../src/utils', async () => ({
  generatePublicEnvironmentsFile: vi.fn().mockReturnValue(true),
  isDeclarative: vi.fn().mockReturnValue(false),
  isLazyViews: vi.fn().mockReturnValue(true),
  isTypescriptApp: vi.fn().mockReturnValue(true)
}))

vi.mock('../../src/react/react-utils', async () => ({
  getViteConfig: vi.fn().mockResolvedValue({ test: true }),
  generateDeclarativeLazyPages: vi.fn(() => ({ definitions: [], layouts: {}, errorPages: {}, adapterErrorPages: {} })),
  generateImperativeLazyPages: vi.fn(() => ({ definitions: [], layouts: {}, errorPages: {}, adapterErrorPages: {} }))
}))

vi.mock('../../src/react/stubs', async () => ({
  reactHtmlEntryPointTemplate: vi.fn(() => '<html><!--main-js--><!--main-css--></html>'),
  reactClientEntryPointTemplate: vi.fn(() => '// client %pattern%\n// %concat%'),
  reactServerEntryPointTemplate: vi.fn(() => '// server %pattern%\n// %blueprint%')
}))

describe('ReactBuildMiddleware', () => {
  const mockNext = vi.fn()
  const context: any = {
    blueprint: {
      get: vi.fn(() => 'views/**/*.tsx'),
      set: vi.fn()
    },
    event: {},
    commandOutput: {
      info: vi.fn()
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(isLazyViews).mockReturnValue(true)
    vi.mocked(isTypescriptApp).mockReturnValue(true)
  })

  it('should skip if not lazy views', async () => {
    vi.mocked(isLazyViews).mockReturnValue(false)

    const result = await GenerateViewsIndexMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(outputFileSync).not.toHaveBeenCalled()
  })

  it('should generate views index if lazy views enabled', async () => {
    vi.mocked(isLazyViews).mockReturnValue(true)
    vi.mocked(globModule.glob.sync).mockReturnValue([
      '/base/views/View1.tsx',
      '/base/views/View2.tsx'
    ])

    const result = await GenerateViewsIndexMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(outputFileSync).toHaveBeenCalledOnce()
    const [filePath, fileContent] = vi.mocked(outputFileSync).mock.calls[0]
    expect(filePath).toContain('viewsIndex.mjs')
    expect(fileContent).toContain('import * as View0 from')
    expect(fileContent).toContain('export const views = {')
  })

  it('should skip middleware if not lazy views', async () => {
    vi.mocked(isLazyViews).mockReturnValue(false)

    const result = await GenerateLazyPageMiddleware(context, mockNext)
    expect(result).toEqual(await mockNext(context))
  })

  it('should generate lazy pages blueprint with declarative structure', async () => {
    vi.mocked(isDeclarative).mockReturnValue(true)
    vi.mocked(isTypescriptApp).mockReturnValue(false)

    const result = await GenerateLazyPageMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(generateDeclarativeLazyPages).toHaveBeenCalled()
    expect(outputFileSync).toHaveBeenCalled()
  })

  it('should generate lazy pages blueprint with imperative fallback', async () => {
    vi.mocked(isDeclarative).mockReturnValue(false)

    const result = await GenerateLazyPageMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(generateImperativeLazyPages).toHaveBeenCalled()
    expect(outputFileSync).toHaveBeenCalled()
    const [outputPath, content] = (outputFileSync as any).mock.calls[0]
    expect(outputPath).toContain('pages.ts')
    expect(content).toContain('dynamicBlueprint')
    expect(content).toContain('import.meta.glob')
  })

  it('should use client.ts and inject pages for lazy TypeScript app', async () => {
    vi.mocked(isLazyViews).mockReturnValue(true)
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('// %concat%')

    const result = await GenerateClientFileMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(outputFileSync).toHaveBeenCalled()
    const [filePath, content] = vi.mocked(outputFileSync).mock.calls[0]
    expect(filePath).toContain('tmp/index.ts')
    expect(content).toContain("import * as pages from './pages")
    expect(content).toContain('.concat(Object.values(pages))')
  })

  it('should use client.mjs and inject pages for lazy JavaScript app', async () => {
    vi.mocked(isTypescriptApp).mockReturnValue(false)
    vi.mocked(isLazyViews).mockReturnValue(true)
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('// %concat%')

    const result = await GenerateClientFileMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(outputFileSync).toHaveBeenCalled()
    const [filePath, content] = vi.mocked(outputFileSync).mock.calls[0]
    expect(filePath).toContain('tmp/index.mjs')
    expect(content).toContain("import * as pages from './pages.mjs")
    expect(content).toContain('.concat(Object.values(pages))')
  })

  it('should fallback to template if no client.ts and not lazy', async () => {
    vi.mocked(isTypescriptApp).mockReturnValue(false)
    vi.mocked(isLazyViews).mockReturnValue(false)
    vi.mocked(existsSync).mockReturnValue(false)

    const result = await GenerateClientFileMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(outputFileSync).toHaveBeenCalled()
    const [filePath, content] = vi.mocked(outputFileSync).mock.calls[0]
    expect(filePath).toContain('tmp/index.mjs')
    expect(content).toContain('./base/views/**/*.tsx')
  })

  it('should use existing index.html file', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('<html><!--main-js--><!--main-css--></html>')
    context.blueprint.get.mockReturnValue('assets/css/index.css')

    const result = await GenerateIndexHtmlFileMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(outputFileSync).toHaveBeenCalled()
    const [, content] = vi.mocked(outputFileSync).mock.calls[0]
    expect(content).toContain('<html><script type="module" src="index.ts"></script><link rel="stylesheet" href="./base/assets/css/index.css" /></html>')
  })

  it('should fallback to reactHtmlEntryPointTemplate', async () => {
    vi.mocked(isTypescriptApp).mockReturnValue(false)
    vi.mocked(existsSync).mockReturnValue(false)
    context.blueprint.get.mockReturnValue('assets/css/index.css')

    const result = await GenerateIndexHtmlFileMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(outputFileSync).toHaveBeenCalled()
    const [, content] = vi.mocked(outputFileSync).mock.calls[0]
    expect(content).toContain('<html><script type="module" src="index.mjs"></script><link rel="stylesheet" href="./base/assets/css/index.css" /></html>')
  })

  it('should build client using vite with merged config', async () => {
    const result = await BuildClientAppMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(vite.build).toHaveBeenCalledOnce()
    const viteArg: any = vi.mocked(vite.build).mock.calls[0][0]

    expect(viteArg?.build?.rollupOptions?.input).toContain('index.html')
    expect(viteArg?.plugins?.[0]?.name).toEqual('vite-plugin-remove-imports')
  })

  it('should build the server app using vite with SSR options', async () => {
    const result = await BuildReactServerAppMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(vite.build).toHaveBeenCalledOnce()
    const viteArg = (vite.build as any).mock.calls[0][0]

    expect(viteArg.build?.ssr).toContain('server.ts')
    expect(viteArg.ssr?.noExternal).toBe(true)
  })

  it('should build the server app using vite with SSR options for JavaScript', async () => {
    vi.mocked(isTypescriptApp).mockReturnValue(false)
    const result = await BuildReactServerAppMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(vite.build).toHaveBeenCalledOnce()
    const viteArg = (vite.build as any).mock.calls[0][0]

    expect(viteArg.build?.ssr).toContain('server.mjs')
    expect(viteArg.ssr?.noExternal).toBe(true)
  })

  it('should move index.html and cleanup temp folders', async () => {
    const result = await BuildReactCleaningMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(moveSync).toHaveBeenCalledWith('./dist/.stone/tmp/index.html', './dist/index.html')
    expect(removeSync).toHaveBeenCalledWith('./build/tmp')
    expect(removeSync).toHaveBeenCalledWith('./dist/.stone')
  })

  it('should inject env script in index.html', async () => {
    vi.mocked(readFileSync).mockReturnValue('<html><!--main-js--><!--main-css--><!--env-js--></html>')

    const result = await GeneratePublicEnvFileMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(readFileSync).toHaveBeenCalledWith('./dist/index.html', 'utf-8')
    expect(outputFileSync).toHaveBeenCalledWith(
      './dist/index.html',
      expect.stringContaining('<script src="/env/environments.js"></script>'),
      'utf-8'
    )
  })

  it('should not inject env script in index.html', async () => {
    vi.mocked(generatePublicEnvironmentsFile).mockReturnValue(false)

    const result = await GeneratePublicEnvFileMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(readFileSync).toHaveBeenCalledWith('./dist/index.html', 'utf-8')
    expect(outputFileSync).toHaveBeenCalledWith(
      './dist/index.html',
      expect.stringContaining('<html><!--main-js--><!--main-css--></html>'),
      'utf-8'
    )
  })

  it('should skip building views if not lazy views', async () => {
    vi.mocked(isLazyViews).mockReturnValue(false)

    const result = await BuildViewsMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(vite.build).not.toHaveBeenCalled()
  })

  it('should build views if lazy enabled', async () => {
    vi.mocked(isLazyViews).mockReturnValue(true)

    const result = await BuildViewsMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))
    expect(vite.build).toHaveBeenCalledOnce()
    const buildArgs: any = vi.mocked(vite.build).mock.calls[0][0]
    expect(buildArgs.build?.lib?.entry).toContain('viewsIndex.mjs')
    expect(buildArgs.build?.rollupOptions?.output?.format).toBe('es')
  })
})

describe('GenerateReactServerFileMiddleware', () => {
  const mockNext = vi.fn()
  const context: any = {
    blueprint: {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'stone.builder.input.all') return 'views/**/*'
        if (key === 'stone.builder.server.printUrls') return true
      })
    },
    event: {}
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use stub if no custom server file and inject HTML template content (TS)', async () => {
    vi.mocked(isTypescriptApp).mockReturnValue(true)

    // No custom server.ts file found
    vi.mocked(existsSync).mockReturnValue(false)

    // First call: read index.html from dist
    // Second call: read server template stub
    vi.mocked(readFileSync)
      .mockReturnValueOnce('INDEX_HTML_CONTENT')
      .mockReturnValueOnce('// server %pattern%\n// %blueprint%\nconst app = {}')

    const result = await GenerateReactServerFileMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))

    expect(readFileSync).toHaveBeenCalledWith('./dist/.stone/tmp/index.html', 'utf-8')

    // Expect two writes: template.mjs + server.ts
    expect(outputFileSync).toHaveBeenCalledTimes(2)

    const [templatePath, templateContent] = (outputFileSync as any).mock.calls[0]
    expect(templatePath).toContain('template.mjs')
    expect(templateContent).toContain('INDEX_HTML_CONTENT')

    const [serverPath, serverContent] = (outputFileSync as any).mock.calls[1]
    expect(serverPath).toContain('server.ts')
    expect(serverContent).toContain('import { indexHtmlTemplate }')
    expect(serverContent).toContain("blueprint.setIf('stone.useReact.htmlTemplateContent'")
    expect(serverContent).not.toContain('%pattern%')
    expect(serverContent).not.toContain('%printUrls%')
  })

  it('should support fallback to server.mjs for JS apps', async () => {
    vi.mocked(isTypescriptApp).mockReturnValue(false)
    vi.mocked(existsSync).mockReturnValue(false)
    vi.mocked(readFileSync)
      .mockReturnValueOnce('<html></html>') // index.html
      .mockReturnValueOnce('// server %pattern%\n// %blueprint%\n') // template

    const result = await GenerateReactServerFileMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))

    const [serverPath] = (outputFileSync as any).mock.calls[1]
    expect(serverPath).toContain('server.mjs')
  })

  it('should use user-provided server.ts content if available', async () => {
    vi.mocked(isTypescriptApp).mockReturnValue(true)
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync)
      .mockReturnValueOnce('<html></html>') // index.html
      .mockReturnValueOnce('// custom user server') // user server.ts

    const result = await GenerateReactServerFileMiddleware(context, mockNext)

    expect(result).toEqual(await mockNext(context))

    const [, serverContent] = (outputFileSync as any).mock.calls[1]
    expect(serverContent).toContain('indexHtmlTemplate')
  })
})
