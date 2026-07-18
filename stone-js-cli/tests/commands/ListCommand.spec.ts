import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'

vi.mock('../../src/utils', async () => {
  const actual = await vi.importActual<any>('../../src/utils')
  return {
    ...actual,
    shouldBuild: vi.fn(),
    isReactApp: vi.fn(),
    setupProcessSignalHandlers: vi.fn()
  }
})

const ReactBuilderConsole = vi.fn()
const ServerBuilderConsole = vi.fn()

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
    vi.mocked(utils.isReactApp).mockReturnValue(true)
    buildPath.mockReturnValue('/dist/console.mjs')

    context = {
      blueprint: {
        get: vi.fn().mockReturnValue('pattern')
      }
    }

    event = {
      type: 'cli',
      payload: {}
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

    expect(ReactBuilderConsole).toHaveBeenCalledWith(event)
    expect(ServerBuilderConsole).not.toHaveBeenCalled()

    expect(spawnMock).toHaveBeenCalledWith(
      'node',
      ['/dist/console.mjs', '--help'],
      { stdio: 'inherit' }
    )
  })

  it('should handle server build if not react', async () => {
    const utils = await import('../../src/utils')
    vi.mocked(utils.isReactApp).mockReturnValue(false)

    const cmd = new ListCommand(context)
    await cmd.handle(event)

    expect(ServerBuilderConsole).toHaveBeenCalledWith(event)
    expect(ReactBuilderConsole).not.toHaveBeenCalled()
  })

  it('should skip build but still spawn --help if shouldBuild is false', async () => {
    const utils = await import('../../src/utils')
    vi.mocked(utils.shouldBuild).mockReturnValue(false)

    const cmd = new ListCommand(context)
    await cmd.handle(event)

    expect(ReactBuilderConsole).not.toHaveBeenCalled()
    expect(ServerBuilderConsole).not.toHaveBeenCalled()
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
