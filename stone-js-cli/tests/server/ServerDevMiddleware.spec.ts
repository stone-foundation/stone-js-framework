import * as fs from 'node:fs'
import fsExtra from 'fs-extra'
import * as utils from '../../src/utils'
import * as stubs from '../../src/server/stubs'
import * as serverUtils from '../../src/server/server-utils'
import { BuildDevServerAppMiddleware, GenerateDevServerFileMiddleware, GenerateConsoleFileMiddleware, ServerDevMiddleware, ConsoleDevMiddleware } from '../../src/server/ServerDevMiddleware'
const { outputFileSync } = fsExtra

vi.mock('fs-extra', async () => {
  return {
    default: {
      outputFileSync: vi.fn()
    }
  }
})

vi.mock('rollup', async () => {
  return {
    rollup: vi.fn(() => ({
      write: vi.fn()
    }))
  }
})

vi.mock('../../src/server/server-utils', async () => {
  return {
    getRollupConfig: vi.fn(async () => ({ input: '', output: {} }))
  }
})

vi.mock('../../src/server/stubs', async () => {
  return {
    serverIndexFile: vi.fn((flag: string) => `server file with ${flag}`),
    consoleIndexFile: vi.fn(() => 'console file')
  }
})

vi.mock('../../src/utils', async () => {
  return {
    setCache: vi.fn()
  }
})

vi.mock('node:fs', async () => {
  return {
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(() => 'read from disk')
  }
})

vi.mock('@stone-js/filesystem', async () => {
  return {
    basePath: vi.fn((p: string) => `/base/${p}`),
    buildPath: vi.fn((p: string) => `/build/${p}`)
  }
})

describe('ServerDevMiddleware', () => {
  let mockContext: any
  let mockNext: any

  beforeEach(() => {
    mockContext = {
      blueprint: {
        get: vi.fn((key, fallback) => {
          if (key === 'stone.builder.server.printUrls') return true
          if (key === 'stone.builder.input.all') return 'app/**/*.ts'
          return fallback
        })
      }
    }
    mockNext = vi.fn(async (ctx) => ctx)
  })

  it('BuildDevServerAppMiddleware should build server app with correct input/output', async () => {
    const result = await BuildDevServerAppMiddleware(mockContext, mockNext)

    expect(serverUtils.getRollupConfig).toHaveBeenCalledWith(mockContext.blueprint)
    expect(result).toBe(mockContext)
    expect(mockNext).toHaveBeenCalledOnce()
  })

  it('GenerateDevServerFileMiddleware should write file from stub if no file exists', async () => {
    const result = await GenerateDevServerFileMiddleware(mockContext, mockNext)

    expect(fs.existsSync).toHaveBeenCalledWith('/base/server.mjs')
    expect(stubs.serverIndexFile).toHaveBeenCalledWith(true)
    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/server.mjs',
      'server file with true',
      'utf-8'
    )
    expect(result).toBe(mockContext)
  })

  it('GenerateDevServerFileMiddleware should replace %printUrls% if file exists', async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true)
    vi.mocked(fs.readFileSync).mockReturnValueOnce("file with '%printUrls%'")

    const result = await GenerateDevServerFileMiddleware(mockContext, mockNext)

    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/server.mjs',
      'server file with true',
      'utf-8'
    )
    expect(result).toBe(mockContext)
  })

  it('GenerateConsoleFileMiddleware should write console file from stub if no file exists', async () => {
    const result = await GenerateConsoleFileMiddleware(mockContext, mockNext)

    expect(fs.existsSync).toHaveBeenCalledWith('/base/console.mjs')
    expect(stubs.consoleIndexFile).toHaveBeenCalled()
    expect(utils.setCache).toHaveBeenCalledWith('app/**/*.ts')
    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/console.mjs',
      'console file',
      'utf-8'
    )
    expect(result).toBe(mockContext)
  })

  it('GenerateConsoleFileMiddleware should read file if exists', async () => {
    vi.mocked(fs.existsSync).mockImplementation((path: any) =>
      path.includes('console.mjs')
    )
    vi.mocked(fs.readFileSync).mockReturnValue('from console.mjs')

    const result = await GenerateConsoleFileMiddleware(mockContext, mockNext)

    expect(outputFileSync).toHaveBeenCalledWith(
      '/build/console.mjs',
      'from console.mjs',
      'utf-8'
    )
    expect(result).toBe(mockContext)
  })

  it('ServerDevMiddleware structure is valid', () => {
    expect(ServerDevMiddleware).toEqual([
      { module: BuildDevServerAppMiddleware, priority: 0 },
      { module: GenerateDevServerFileMiddleware, priority: 1 }
    ])
  })

  it('ConsoleDevMiddleware structure is valid', () => {
    expect(ConsoleDevMiddleware).toEqual([
      { module: BuildDevServerAppMiddleware, priority: 0 },
      { module: GenerateConsoleFileMiddleware, priority: 2 }
    ])
  })
})
