import { watch } from 'chokidar'
import { Pipeline } from '@stone-js/pipeline'
import { CliError } from '../../src/errors/CliError'
import { ConsoleContext } from '../../src/declarations'
import { ServerBuilder } from '../../src/server/ServerBuilder'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn()
}))

vi.mock('chokidar', () => ({
  watch: vi.fn(() => ({
    close: vi.fn(),
    on: vi.fn().mockReturnThis()
  }))
}))

vi.mock('@stone-js/pipeline', async () => {
  const actual = await vi.importActual<any>('@stone-js/pipeline')
  return {
    ...actual,
    Pipeline: {
      create: vi.fn().mockReturnValue({
        send: vi.fn().mockReturnThis(),
        through: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValue({ blueprint: { get: vi.fn() } })
      })
    }
  }
})

vi.mock('@stone-js/filesystem', async () => {
  const actual = await vi.importActual<any>('@stone-js/filesystem')
  return {
    ...actual,
    basePath: (file: string) => `/mocked/${file}`,
    distPath: (file: string) => `/mocked/dist/${file}`,
    dirPath: (file: string) => `/mocked/dir/${file}`
  }
})

vi.mock('../../src/server/stubs', async (mod) => {
  const actual: any = await mod()
  return {
    ...actual,
    serverIndexFile: vi.fn(() => 'server-content'),
    consoleIndexFile: vi.fn(() => 'console-content')
  }
})

describe('ServerBuilder', () => {
  let builder: ServerBuilder
  let context: ConsoleContext
  let mockedWatcher: any
  const spyOn = vi.spyOn

  beforeEach(() => {
    vi.clearAllMocks()

    mockedWatcher = {
      on: vi.fn().mockReturnThis(),
      close: vi.fn()
    }

    spyOn(console, 'log').mockImplementation(() => {})
    spyOn(process, 'on').mockImplementation((_event, handler) => {
      if (_event === 'SIGINT' || _event === 'SIGTERM') {
        // Simulate signal
        handler()
      }
      return process
    })

    vi.mocked(watch).mockReturnValue(mockedWatcher)

    context = {
      blueprint: {
        get: vi.fn((key: string, fallback: any) => {
          if (key === 'stone.builder.watcher.ignored') { return ['node_modules/**', 'dist/**', '.stone/**', '.git/**'] }
          if (key === 'stone.builder.watcher.debounce') { return 20 }
          if (key === 'stone.builder.input.all') { return 'app/**/*.**' }
          return fallback
        }),
        set: vi.fn()
      },
      commandInput: {
        confirm: vi.fn().mockResolvedValue(true)
      },
      commandOutput: {
        info: vi.fn(),
        show: vi.fn()
      }
    } as any

    builder = new ServerBuilder(context)
  })

  it('build should execute pipeline with ServerBuildMiddleware', async () => {
    await builder.build({} as any)
    expect(Pipeline.create).toHaveBeenCalled()
  })

  it('dev should set printUrls and run ServerDevMiddleware', async () => {
    await builder.dev({} as any, false)
    expect(context.blueprint.set).toHaveBeenCalledWith('stone.builder.server.printUrls', true)
  })

  it('preview should throw if output file does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    expect(() => builder.preview({} as any)).toThrow(CliError)
  })

  it('preview should not throw if output file exists', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    expect(() => builder.preview({} as any)).not.toThrow()
  })

  it('console should execute pipeline with ConsoleDevMiddleware', async () => {
    await builder.console({} as any)
    expect(Pipeline.create).toHaveBeenCalled()
  })

  it('should export app module correctly', async () => {
    vi.mocked(existsSync).mockReturnValue(false)
    await builder.export({ get: () => 'app' } as any)
    expect(writeFileSync).toHaveBeenCalledWith('/mocked/server.mjs', 'server-content', 'utf-8')
  })

  it('should not export app module', async () => {
    // @ts-expect-error
    builder.confirmCreation = vi.fn().mockResolvedValue(false)
    await builder.export({ get: () => 'app' } as any)
    expect(writeFileSync).not.toHaveBeenCalledWith('/mocked/server.mjs', 'server-content', 'utf-8')
  })

  it('should export console module correctly', async () => {
    await builder.export({ get: () => 'console' } as any)
    expect(writeFileSync).toHaveBeenCalledWith('/mocked/console.mjs', 'console-content', 'utf-8')
  })

  it('should export rollup module correctly', async () => {
    vi.mocked(readFileSync).mockReturnValue('rollup-code')
    await builder.export({ get: () => 'rollup' } as any)
    expect(writeFileSync).toHaveBeenCalledWith('/mocked/rollup.config.mjs', 'rollup-code', 'utf-8')
  })

  it('should not export rollup module', async () => {
    // @ts-expect-error
    builder.confirmCreation = vi.fn().mockResolvedValue(false)
    await builder.export({ get: () => 'rollup' } as any)
    expect(writeFileSync).not.toHaveBeenCalledWith('/mocked/rollup.config.mjs', 'rollup-code', 'utf-8')
  })

  it('should not export if confirmCreation is false', async () => {
    context.commandInput.confirm = vi.fn().mockResolvedValue(false)
    vi.mocked(existsSync).mockReturnValue(true)
    await builder.export({ get: () => 'console' } as any)
    expect(writeFileSync).not.toHaveBeenCalled()
  })

  it('should watch the source root + configs (not the whole tree) and debounce the callback', async () => {
    vi.useFakeTimers()
    const cb = vi.fn()
    builder.watchFiles(cb)

    expect(watch).toHaveBeenCalledWith(
      expect.arrayContaining(['app', 'stone.config.mjs', 'rollup.config.mjs']),
      expect.objectContaining({
        ignored: ['node_modules/**', 'dist/**', '.stone/**', '.git/**'],
        persistent: true
      })
    )
    expect(watch).not.toHaveBeenCalledWith('.', expect.anything())

    const onCalls = mockedWatcher.on.mock.calls
    const changeHandler = onCalls.find(([event]: string[]) => event === 'change')[1]
    const addHandler = onCalls.find(([event]: string[]) => event === 'add')[1]

    changeHandler('foo.ts')
    addHandler('bar.ts')

    // Debounced: callback runs once, for the last change, after the debounce window.
    expect(cb).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(30)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith('bar.ts', 1)
    vi.useRealTimers()
  })

  it('should pass an incrementing change count for the same file', async () => {
    vi.useFakeTimers()
    const cb = vi.fn()
    builder.watchFiles(cb)

    const changeHandler = mockedWatcher.on.mock.calls.find(([event]: string[]) => event === 'change')[1]

    changeHandler('file.ts')
    changeHandler('file.ts')
    changeHandler('file.ts')

    await vi.advanceTimersByTimeAsync(30)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith('file.ts', 3)
    vi.useRealTimers()
  })

  it('should fall back to the "app" source root when input.all has no leading segment', () => {
    ;(context.blueprint.get as any).mockImplementation((key: string, fallback: any) => {
      if (key === 'stone.builder.input.all') { return '/**/*.ts' } // leading slash → empty first segment
      if (key === 'stone.builder.watcher.debounce') { return 20 }
      if (key === 'stone.builder.watcher.ignored') { return ['node_modules/**'] }
      return fallback
    })

    builder.watchFiles(() => {})

    expect(watch).toHaveBeenCalledWith(expect.arrayContaining(['app']), expect.any(Object))
  })

  it('should register SIGINT and SIGTERM listeners to close watcher', async () => {
    builder.watchFiles(() => {})
    expect(mockedWatcher.close).toHaveBeenCalledTimes(2)
  })
})
