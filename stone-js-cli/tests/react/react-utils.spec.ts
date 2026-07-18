import {
  getViteConfig,
  runDevServer,
  runPreviewServer,
  generateImperativeLazyPages,
  generateDeclarativeLazyPages
} from '../../src/react/react-utils'
import { existsSync } from 'fs'
import { getMetadata } from '@stone-js/core'
import { getStoneBuilderConfig } from '../../src/utils'
import { loadConfigFromFile, preview, createServer } from 'vite'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('fs', async () => ({
  existsSync: vi.fn()
}))

vi.mock('vite', async () => ({
  preview: vi.fn(),
  defineConfig: vi.fn(),
  mergeConfig: vi.fn((a, b) => ({ ...a, ...b })),
  createServer: vi.fn(),
  loadConfigFromFile: vi.fn()
}))

vi.mock('../../src/react/vite-config', async () => ({
  viteConfig: vi.fn().mockImplementation(({ command, mode }) => ({
    command,
    mode
  }))
}))

vi.mock('../../src/react/RemoveImportsVitePlugin', async () => ({
  removeImportsVitePlugin: vi.fn().mockImplementation(() => 'plugin')
}))

vi.mock('../../src/utils', async () => ({
  getStoneBuilderConfig: vi.fn().mockResolvedValue({
    server: { printUrls: true },
    browser: { excludedModules: ['a'] },
    vite: { foo: 'bar' }
  })
}))

vi.mock('@stone-js/filesystem', async () => ({
  basePath: vi.fn((...args) => args.join('/')),
  buildPath: vi.fn(() => '/build'),
  distPath: vi.fn(() => '/dist')
}))

vi.mock('@stone-js/core', async () => {
  const actual = await vi.importActual<any>('@stone-js/core')
  return {
    ...actual,
    getMetadata: vi.fn(() => ({})),
    isNotEmpty: vi.fn((val) => Object.keys(val ?? {}).length > 0),
    isObjectLikeModule: vi.fn((val) => typeof val === 'object' && !Array.isArray(val))
  }
})

describe('getViteConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads config.ts if exists', async () => {
    vi.mocked(existsSync).mockImplementation((path: any) => path.includes('.ts'))
    vi.mocked(loadConfigFromFile).mockResolvedValueOnce({ config: { loaded: true } } as any)

    const result = await getViteConfig('serve', 'development')
    expect(result).toEqual(expect.objectContaining({ loaded: true, foo: 'bar' }))
  })

  it('loads config.js if .ts not exists', async () => {
    vi.mocked(existsSync).mockImplementation((path: any) => path.includes('.js'))
    vi.mocked(loadConfigFromFile).mockResolvedValueOnce({ config: { js: true } } as any)

    const result = await getViteConfig('build', 'production')
    expect(result).toEqual(expect.objectContaining({ js: true, foo: 'bar' }))
  })

  it('loads config.mjs as fallback', async () => {
    vi.mocked(existsSync).mockImplementation((path: any) => path.includes('.mjs'))
    vi.mocked(loadConfigFromFile).mockResolvedValueOnce({ config: { mjs: true } } as any)

    const result = await getViteConfig('serve', 'production')
    expect(result).toEqual(expect.objectContaining({ mjs: true, foo: 'bar' }))
  })

  it('falls back to default viteConfig', async () => {
    vi.mocked(existsSync).mockReturnValue(false)
    vi.mocked(getStoneBuilderConfig).mockResolvedValue({
      server: {},
      browser: { excludedModules: ['a'] }
    } as any)
    const result = await getViteConfig('serve', 'development')
    expect(result).toEqual(expect.objectContaining({ command: 'serve', mode: 'development' }))
  })
})

describe('runDevServer', () => {
  it('starts dev server with printUrls', async () => {
    const listen = vi.fn()
    const printUrls = vi.fn()
    const bindCLIShortcuts = vi.fn()
    vi.mocked(createServer).mockResolvedValueOnce({ listen, printUrls, bindCLIShortcuts } as any)

    const server = await runDevServer()
    expect(listen).toHaveBeenCalled()
    expect(printUrls).toHaveBeenCalled()
    expect(bindCLIShortcuts).toHaveBeenCalledWith({ print: true })
    expect(server).toEqual(expect.objectContaining({ listen }))
  })

  it('starts dev server with printUrls when excludedModules is empty', async () => {
    const listen = vi.fn()
    const printUrls = vi.fn()
    const bindCLIShortcuts = vi.fn()
    vi.mocked(createServer).mockResolvedValueOnce({ listen, printUrls, bindCLIShortcuts } as any)
    vi.mocked(getStoneBuilderConfig).mockResolvedValue({
      server: {},
      browser: {}
    } as any)

    const server = await runDevServer()
    expect(listen).toHaveBeenCalled()
    expect(printUrls).toHaveBeenCalled()
    expect(bindCLIShortcuts).toHaveBeenCalledWith({ print: true })
    expect(server).toEqual(expect.objectContaining({ listen }))
  })
})

describe('runPreviewServer', () => {
  it('starts preview server with printUrls', async () => {
    const printUrls = vi.fn()
    const bindCLIShortcuts = vi.fn()
    vi.mocked(preview).mockResolvedValueOnce({ printUrls, bindCLIShortcuts } as any)
    vi.mocked(getStoneBuilderConfig).mockResolvedValue({
      server: {},
      browser: { excludedModules: ['a'] },
      vite: { foo: 'bar' }
    } as any)

    const server = await runPreviewServer()
    expect(printUrls).toHaveBeenCalled()
    expect(bindCLIShortcuts).toHaveBeenCalledWith({ print: true })
    expect(server).toEqual(expect.objectContaining({ printUrls }))
  })

  it('starts preview server with no printUrls', async () => {
    const printUrls = vi.fn()
    const bindCLIShortcuts = vi.fn()
    vi.mocked(preview).mockResolvedValueOnce({ printUrls, bindCLIShortcuts } as any)
    vi.mocked(getStoneBuilderConfig).mockResolvedValue({
      server: { printUrls: false },
      browser: { excludedModules: ['a'] },
      vite: { foo: 'bar' }
    } as any)

    const server = await runPreviewServer()
    expect(printUrls).not.toHaveBeenCalled()
    expect(bindCLIShortcuts).not.toHaveBeenCalled()
    expect(server).toEqual(expect.objectContaining({ printUrls }))
  })
})

describe('generateDeclarativeLazyPages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns layout metadata', () => {
    vi.mocked(getMetadata)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ name: 'default' })
    const result = generateDeclarativeLazyPages(class {}, 'some/path', 'Layout')
    expect(result.layouts.default.lazy).toBe(true)
  })

  it('returns layout metadata (default)', () => {
    vi.mocked(getMetadata)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ invalid: '' })
    const result = generateDeclarativeLazyPages(class {}, 'some/path', 'Layout')
    expect(result.layouts.default.lazy).toBe(true)
  })

  it('returns error page metadata', () => {
    vi.mocked(getMetadata)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ error: 'notFound' })
    const result = generateDeclarativeLazyPages(class {}, 'error/path', 'Error')
    expect(result.errorPages.notFound.lazy).toBe(true)
  })

  it('returns error page metadata (default)', () => {
    vi.mocked(getMetadata)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ invalid: 'notFound' })
    const result = generateDeclarativeLazyPages(class {}, 'error/path', 'Error')
    expect(result.errorPages.default.lazy).toBe(true)
  })

  it('returns adapter error page metadata', () => {
    vi.mocked(getMetadata)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ error: 'badRequest' })
    const result = generateDeclarativeLazyPages(class {}, 'error/path', 'Error')
    expect(result.adapterErrorPages.badRequest.lazy).toBe(true)
  })

  it('returns adapter error page metadata (default)', () => {
    vi.mocked(getMetadata)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ invalid: 'badRequest' })
    const result = generateDeclarativeLazyPages(class {}, 'error/path', 'Error')
    expect(result.adapterErrorPages.default.lazy).toBe(true)
  })

  it('returns page definition', () => {
    vi.mocked(getMetadata)
      .mockReturnValueOnce({ handler: {} })

    const result: any = generateDeclarativeLazyPages(class {}, 'page/path', 'Page')
    expect(result.definitions).toHaveLength(1)
    expect(result.definitions[0].handler.lazy).toBe(true)
  })
})

describe('generateImperativeLazyPages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles layout modules', () => {
    const blueprint: any = { stone: { useReact: { layout: { default: { test: true } } } } }
    const result = generateImperativeLazyPages(blueprint, 'lazy/path', 'Layout')
    expect(result.layouts.default.lazy).toBe(true)
  })

  it('handles error pages', () => {
    const blueprint: any = { stone: { useReact: { errorPages: { notFound: { code: 404 } } } } }
    const result = generateImperativeLazyPages(blueprint, 'lazy/path', 'Error')
    expect(result.errorPages.notFound.lazy).toBe(true)
  })

  it('handles adapter error pages', () => {
    const blueprint: any = { stone: { useReact: { adapterErrorPages: { boom: { code: 500 } } } } }
    const result = generateImperativeLazyPages(blueprint, 'lazy/path', 'Error')
    expect(result.adapterErrorPages.boom.lazy).toBe(true)
  })

  it('handles router definitions', () => {
    const blueprint: any = {
      stone: {
        router: {
          definitions: [{ handler: {} }]
        }
      }
    }
    const result: any = generateImperativeLazyPages(blueprint, 'route/path', 'MyPage')
    expect(result.definitions).toHaveLength(1)
    expect(result.definitions[0].handler.lazy).toBe(true)
  })
})
