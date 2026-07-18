import { Pipeline } from '@stone-js/pipeline'
import { CliError } from '../../src/errors/CliError'
import { ReactBuilder } from '../../src/react/ReactBuilder'
import { isCSR, isSSR, isSSG, isTypescriptApp } from '../../src/utils'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

vi.mock('node:fs')

vi.mock('@stone-js/filesystem')

vi.mock('../../src/react/ReactBuildMiddleware', () => ({
  ReactCSRBuildMiddleware: ['csr'],
  ReactSSRBuildMiddleware: ['ssr'],
  ReactSSGBuildMiddleware: ['ssg']
}))

vi.mock('../../src/react/ReactDevMiddleware', () => ({
  ReactDevMiddleware: ['dev'],
  ReactConsoleMiddleware: ['console']
}))

vi.mock('../../src/react/ReactPreviewMiddleware', () => ({
  ReactPreviewMiddleware: ['preview']
}))

vi.mock('../../src/utils', async () => {
  const actual = await vi.importActual<typeof import('../../src/utils')>('../../src/utils')
  return {
    ...actual,
    isCSR: vi.fn(),
    isSSR: vi.fn(),
    isSSG: vi.fn(() => false),
    isTypescriptApp: vi.fn(() => true),
    dirPath: vi.fn().mockReturnValue('/fake/dir')
  }
})

const mockBlueprint: any = {
  get: vi.fn().mockReturnValue('')
}
const mockEvent: any = {
  get: vi.fn().mockReturnValue('app')
}

// Identity proxy standing in for chalk: any `.color.modifier(text)` returns `text`.
const identityFormat: any = new Proxy((v: string) => v, {
  get: () => identityFormat,
  apply: (_t, _this, args) => args[0]
})

const mockContext: any = {
  blueprint: mockBlueprint,
  event: mockEvent,
  commandOutput: {
    info: vi.fn(),
    show: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    succeed: vi.fn(),
    breakLine: vi.fn(),
    spin: vi.fn(() => ({ stop: vi.fn() })),
    format: identityFormat
  },
  commandInput: {
    confirm: vi.fn().mockResolvedValue(true)
  }
}

describe('ReactBuilder', () => {
  let builder: ReactBuilder

  beforeEach(() => {
    builder = new ReactBuilder(mockContext)
    vi.clearAllMocks()
  })

  it('should call dev middleware on dev()', async () => {
    // @ts-expect-error
    builder.executeThroughPipeline = vi.fn().mockResolvedValue(undefined)
    await builder.dev(mockEvent)
    // @ts-expect-error
    expect(builder.executeThroughPipeline).toHaveBeenCalledWith(['dev'])
  })

  it('should call preview middleware on preview()', async () => {
    // @ts-expect-error
    builder.executeThroughPipeline = vi.fn().mockResolvedValue(undefined)
    await builder.preview(mockEvent)
    // @ts-expect-error
    expect(builder.executeThroughPipeline).toHaveBeenCalledWith(['preview'])
  })

  it('should call console middleware on console()', async () => {
    // @ts-expect-error
    builder.executeThroughPipeline = vi.fn().mockResolvedValue(undefined)
    await builder.console(mockEvent)
    // @ts-expect-error
    expect(builder.executeThroughPipeline).toHaveBeenCalledWith(['console'])
  })

  it('should execute CSR build middleware and exit', async () => {
    vi.mocked(isCSR).mockReturnValue(true)

    // @ts-expect-error
    builder.executeThroughPipeline = vi.fn().mockResolvedValue(undefined)

    // Mock process.exit
    const exit = vi.spyOn(process, 'exit').mockReturnValue(0 as unknown as never)

    // Safely mock setImmediate with unref
    const unrefMock = vi.fn()
    const setImmediateMock = vi.fn((fn: () => void) => {
      fn()
      return { unref: unrefMock }
    })
    vi.stubGlobal('setImmediate', setImmediateMock)

    await builder.build(mockEvent)

    // Assertions
    expect(setImmediateMock).toHaveBeenCalled()
    expect(unrefMock).toHaveBeenCalled()
    expect(exit).toHaveBeenCalledWith(0)
    // @ts-expect-error
    expect(builder.executeThroughPipeline).toHaveBeenCalledWith(['csr'])
    expect(mockContext.commandOutput.show).toHaveBeenCalledWith(expect.stringContaining('CSR'))
    expect(mockContext.commandOutput.succeed).toHaveBeenCalledWith(expect.stringContaining('built successfully'))
  })

  it('should execute SSG build middleware (checked first) and exit', async () => {
    vi.mocked(isSSG).mockReturnValue(true)
    mockBlueprint.get.mockReturnValueOnce(undefined) // version → '' via ?? fallback
    // @ts-expect-error
    builder.executeThroughPipeline = vi.fn().mockResolvedValue(undefined)

    const exit = vi.spyOn(process, 'exit').mockReturnValue(0 as unknown as never)
    const setImmediateMock = vi.fn((fn: () => void) => { fn(); return { unref: vi.fn() } })
    vi.stubGlobal('setImmediate', setImmediateMock)

    await builder.build(mockEvent)

    // @ts-expect-error
    expect(builder.executeThroughPipeline).toHaveBeenCalledWith(['ssg'])
    expect(mockContext.commandOutput.show).toHaveBeenCalledWith(expect.stringContaining('SSG'))
    expect(exit).toHaveBeenCalledWith(0)
    vi.mocked(isSSG).mockReturnValue(false)
  })

  it('should execute SSR build middleware and exit', async () => {
    vi.mocked(isCSR).mockReturnValue(false)
    vi.mocked(isSSR).mockReturnValue(true)
    // @ts-expect-error
    builder.executeThroughPipeline = vi.fn().mockResolvedValue(undefined)

    // Mock process.exit
    const exit = vi.spyOn(process, 'exit').mockReturnValue(0 as unknown as never)

    // Safely mock setImmediate with unref
    const unrefMock = vi.fn()
    const setImmediateMock = vi.fn((fn: () => void) => {
      fn()
      return { unref: unrefMock }
    })
    vi.stubGlobal('setImmediate', setImmediateMock)

    await builder.build(mockEvent)

    // Assertions
    expect(setImmediateMock).toHaveBeenCalled()
    expect(unrefMock).toHaveBeenCalled()
    expect(exit).toHaveBeenCalledWith(0)
    // @ts-expect-error
    expect(builder.executeThroughPipeline).toHaveBeenCalledWith(['ssr'])
    expect(mockContext.commandOutput.show).toHaveBeenCalledWith(expect.stringContaining('SSR'))
    expect(mockContext.commandOutput.succeed).toHaveBeenCalledWith(expect.stringContaining('built successfully'))
  })

  it('should throw CliError if no build type matches', async () => {
    vi.mocked(isCSR).mockReturnValue(false)
    vi.mocked(isSSR).mockReturnValue(false)
    // @ts-expect-error
    expect(() => builder.getBuildMiddleware(mockEvent)).toThrow(CliError)
  })

  it.each([
    ['index.html', 'exportIndexHtml'],
    ['client.ts', 'exportClientTemplate'],
    ['server.ts', 'exportServerTemplate'],
    ['console.ts', 'exportConsoleTemplate'],
    ['vite.config.ts', 'exportViteConfig']
  ])('should export %s', async (_, method) => {
    vi.mocked(existsSync).mockReturnValue(false)
    vi.mocked(writeFileSync).mockReturnValue(undefined)
    vi.mocked(readFileSync).mockReturnValue('vite config')
    vi.mocked(isTypescriptApp).mockReturnValue(true)

    const result = await (builder as any)[method]()
    expect(result).toBe(true)
  })

  it.each([
    ['index.html', 'exportIndexHtml'],
    ['client.ts', 'exportClientTemplate'],
    ['server.ts', 'exportServerTemplate'],
    ['console.ts', 'exportConsoleTemplate'],
    ['vite.config.ts', 'exportViteConfig']
  ])('should skip exporting %s if confirm returns false', async (_, method) => {
    vi.mocked(existsSync).mockReturnValue(true)
    // @ts-expect-error
    builder.context.commandInput.confirm = vi.fn().mockResolvedValue(false)
    vi.mocked(isTypescriptApp).mockReturnValue(false)
    const result = await (builder as any)[method]()
    expect(result).toBe(false)
  })

  it('should return true in confirmCreation if file does not exist', async () => {
    vi.mocked(existsSync).mockReturnValue(false)
    const result = await (builder as any).confirmCreation('somefile.ts')
    expect(result).toBe(true)
  })

  it('should call confirm if file exists', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    mockContext.commandInput.confirm = vi.fn().mockResolvedValue(true)
    const result = await (builder as any).confirmCreation('somefile.ts')
    expect(result).toBe(true)
  })

  it('should execute pipeline with correct pipes', async () => {
    const pipes = ['a', 'b']
    const create = vi.spyOn(Pipeline, 'create').mockReturnValue({
      send: vi.fn().mockReturnThis(),
      through: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue(mockContext)
    } as any)
    await (builder as any).executeThroughPipeline(pipes)
    expect(create).toHaveBeenCalled()
  })

  it('should export app module', async () => {
    // Arrange
    mockEvent.get = vi.fn().mockReturnValue('app')
    const exportClient = vi.spyOn(builder as any, 'exportClientTemplate').mockResolvedValue(undefined)
    const exportServer = vi.spyOn(builder as any, 'exportServerTemplate').mockResolvedValue(undefined)
    const exportIndex = vi.spyOn(builder as any, 'exportIndexHtml').mockResolvedValue(true)

    // Act
    await builder.export(mockEvent)

    // Assert
    expect(exportClient).toHaveBeenCalled()
    expect(exportServer).toHaveBeenCalled()
    expect(exportIndex).toHaveBeenCalled()
    expect(mockContext.commandOutput.info).toHaveBeenCalledWith('Module(app) exported!')
  })

  it('should export console module', async () => {
    // Arrange
    mockEvent.get = vi.fn().mockReturnValue('console')
    const exportConsole = vi.spyOn(builder as any, 'exportConsoleTemplate').mockResolvedValue(true)

    // Act
    await builder.export(mockEvent)

    // Assert
    expect(exportConsole).toHaveBeenCalled()
    expect(mockContext.commandOutput.info).toHaveBeenCalledWith('Module(console) exported!')
  })

  it('should export vite module', async () => {
    // Arrange
    mockEvent.get = vi.fn().mockReturnValue('vite')
    const exportVite = vi.spyOn(builder as any, 'exportViteConfig').mockResolvedValue(true)

    // Act
    await builder.export(mockEvent)

    // Assert
    expect(exportVite).toHaveBeenCalled()
    expect(mockContext.commandOutput.info).toHaveBeenCalledWith('Module(vite) exported!')
  })

  it('should not call info if nothing was exported', async () => {
    // Arrange
    mockEvent.get = vi.fn().mockReturnValue('vite')
    const exportVite = vi.spyOn(builder as any, 'exportViteConfig').mockResolvedValue(false)

    // Act
    await builder.export(mockEvent)

    // Assert
    expect(exportVite).toHaveBeenCalled()
    expect(mockContext.commandOutput.info).not.toHaveBeenCalled()
  })
})
