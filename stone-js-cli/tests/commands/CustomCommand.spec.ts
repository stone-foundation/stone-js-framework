vi.mock('@stone-js/filesystem', () => ({
  buildPath: vi.fn()
}))

vi.mock('../../src/utils', async () => {
  const actual = await vi.importActual<any>('../../src/utils')
  return {
    ...actual,
    shouldBuild: vi.fn(),
    isReactApp: vi.fn(),
    setupProcessSignalHandlers: vi.fn()
  }
})

describe('CustomCommand (dynamic import workaround)', async () => {
  let CustomCommand: any
  let customCommandOptions: any
  let spawnMock: any
  let buildPath: any
  let context: any
  let event: any

  const ReactBuilderConsole = vi.fn()
  const ServerBuilderConsole = vi.fn()

  beforeEach(async () => {
    vi.resetModules()

    // Dynamically import after mocking
    spawnMock = vi.fn(() => ({
      on: vi.fn()
    }))

    vi.doMock('cross-spawn', () => ({
      default: spawnMock
    }))

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

    const mod = await import('../../src/commands/CustomCommand')
    CustomCommand = mod.CustomCommand
    customCommandOptions = mod.customCommandOptions

    const fs = await import('@stone-js/filesystem')
    buildPath = fs.buildPath

    const utils = await import('../../src/utils')
    vi.mocked(utils.shouldBuild).mockReturnValue(true)
    vi.mocked(utils.isReactApp).mockReturnValue(true)
    buildPath.mockReturnValue('/dist/console.mjs')

    context = {
      blueprint: {
        get: vi.fn().mockReturnValue('pattern')
      },
      commandOutput: {
        show: vi.fn(),
        format: {
          yellow: (text: string) => `yellow(${text})`
        }
      }
    }

    event = { type: 'cli', payload: {} }
  })

  it('should handle react build and start process', async () => {
    const cmd = new CustomCommand(context)
    await cmd.handle(event)

    expect(ReactBuilderConsole).toHaveBeenCalledWith(event)
    expect(spawnMock).toHaveBeenCalledWith(
      'node',
      ['/dist/console.mjs', ...process.argv.slice(2)],
      { stdio: 'inherit' }
    )
  })

  it('should handle server build if not react', async () => {
    const utils = await import('../../src/utils')
    vi.mocked(utils.isReactApp).mockReturnValue(false)

    const cmd = new CustomCommand(context)
    await cmd.handle(event)

    expect(ServerBuilderConsole).toHaveBeenCalledWith(event)
  })

  it('should skip build and only start process', async () => {
    const utils = await import('../../src/utils')
    vi.mocked(utils.shouldBuild).mockReturnValue(false)

    const cmd = new CustomCommand(context)
    await cmd.handle(event)

    expect(ReactBuilderConsole).not.toHaveBeenCalled()
    expect(ServerBuilderConsole).not.toHaveBeenCalled()
    expect(spawnMock).toHaveBeenCalled()
  })

  it('should define correct CLI metadata', () => {
    expect(customCommandOptions).toEqual({
      name: '*',
      desc: 'Redirect to user-defined commands'
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
})
