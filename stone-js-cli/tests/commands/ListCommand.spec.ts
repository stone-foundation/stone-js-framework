import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'

vi.mock('../../src/utils', async () => {
  const actual = await vi.importActual<any>('../../src/utils')
  return {
    ...actual,
    shouldBuild: vi.fn(),
    setupProcessSignalHandlers: vi.fn()
  }
})

const consoleStep = vi.fn()
const fallbackStep = vi.fn()

vi.doMock('../../src/react/ReactBuilder', () => ({
  ReactBuilder: class {
    console = ReactBuilderConsole
  }
}))

vi.doMock('../../src/server/ServerBuilder', () => ({
  ServerBuilder: class {
    console = ServerBuilderConsole
  }
}))

vi.mock('@stone-js/filesystem', () => ({
  buildPath: vi.fn()
}))

describe('ListCommand (dynamic import workaround)', async () => {
  let ListCommand: any
  let listCommandOptions: any
  let spawnMock: any
  let buildPath: any
  let context: any
  let event: IncomingEvent

  beforeEach(async () => {
    vi.resetModules()

    spawnMock = vi.fn(() => ({
      on: vi.fn()
    }))

    vi.doMock('cross-spawn', () => ({
      default: spawnMock
    }))

    const mod = await import('../../src/commands/ListCommand')
    ListCommand = mod.ListCommand
    listCommandOptions = mod.listCommandOptions

    buildPath = (await import('@stone-js/filesystem')).buildPath

    const utils = await import('../../src/utils')
    vi.mocked(utils.shouldBuild).mockReturnValue(true)
    buildPath.mockReturnValue('/dist/console.mjs')

    context = {
      blueprint: {
        get: vi.fn((key: string) => {
          if (key === 'stone.builder.builders') {
            return {
              react: { target: 'react', priority: 10, match: () => true, resolver: () => ({ console: consoleStep }) },
              server: { target: 'server', priority: 100, match: () => true, resolver: () => ({ console: fallbackStep }) }
            }
          }
          if (key === 'stone.builder.target') { return undefined }
          return 'pattern'
        })
      }
    }

    event = {
      type: 'cli',
      payload: {},
      get: vi.fn(),
      is: vi.fn()
    } as unknown as IncomingEvent
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle react build and spawn --help', async () => {
    const cmd = new ListCommand(context)
    await cmd.handle(event)

    expect(context.blueprint.get).toHaveBeenCalledWith(
      'stone.builder.input.all',
      'app/**/*.**'
    )

    expect(consoleStep).toHaveBeenCalledWith(event)
    expect(fallbackStep).not.toHaveBeenCalled()

    expect(spawnMock).toHaveBeenCalledWith(
      'node',
      ['/dist/console.mjs', '--help'],
      { stdio: 'inherit' }
    )
  })

  it('falls through to the target that answers anything', async () => {
    context.blueprint.get = vi.fn((key: string) => {
      if (key === 'stone.builder.builders') {
        return {
          react: { target: 'react', priority: 10, match: () => false, resolver: () => ({ console: consoleStep }) },
          server: { target: 'server', priority: 100, match: () => true, resolver: () => ({ console: fallbackStep }) }
        }
      }
      if (key === 'stone.builder.target') { return undefined }
      return 'pattern'
    })

    const cmd = new ListCommand(context)
    await cmd.handle(event)

    expect(fallbackStep).toHaveBeenCalledWith(event)
    expect(consoleStep).not.toHaveBeenCalled()
  })

  it('should skip build but still spawn --help if shouldBuild is false', async () => {
    const utils = await import('../../src/utils')
    vi.mocked(utils.shouldBuild).mockReturnValue(false)

    const cmd = new ListCommand(context)
    await cmd.handle(event)

    expect(consoleStep).not.toHaveBeenCalled()
    expect(fallbackStep).not.toHaveBeenCalled()
    expect(spawnMock).toHaveBeenCalled()
  })

  it('should define correct CLI metadata', () => {
    expect(listCommandOptions).toEqual({
      name: 'list',
      alias: 'ls',
      desc: 'List all user-defined commands'
    })
  })

  it('should cast yargs options type correctly (integration style)', () => {
    const mockYargs = {
      option: vi.fn().mockReturnThis(),
      positional: vi.fn().mockReturnThis()
    }

    const fn = listCommandOptions.options as ((args: Argv<any>) => Argv<any>)
    if (fn !== undefined) {
      const result = fn(mockYargs as any)
      expect(result).toBe(mockYargs)
    }
  })
})
