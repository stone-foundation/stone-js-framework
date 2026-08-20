vi.mock('@stone-js/filesystem', () => ({
  buildPath: vi.fn()
}))

vi.mock('../../src/utils', async () => {
  const actual = await vi.importActual<any>('../../src/utils')
  return {
    ...actual,
    shouldBuild: vi.fn(),
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

  const consoleStep = vi.fn()
  const fallbackStep = vi.fn()

  beforeEach(async () => {
    vi.resetModules()

    // Dynamically import after mocking
    spawnMock = vi.fn(() => ({
      on: vi.fn()
    }))

    vi.doMock('cross-spawn', () => ({
      default: spawnMock
    }))



    const mod = await import('../../src/commands/CustomCommand')
    CustomCommand = mod.CustomCommand
    customCommandOptions = mod.customCommandOptions

    const fs = await import('@stone-js/filesystem')
    buildPath = fs.buildPath

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
      },
      commandOutput: {
        show: vi.fn(),
        format: {
          yellow: (text: string) => `yellow(${text})`
        }
      }
    }

    event = { type: 'cli', payload: {}, get: vi.fn(), is: vi.fn() }
  })

  it('should handle react build and start process', async () => {
    const cmd = new CustomCommand(context)
    await cmd.handle(event)

    expect(consoleStep).toHaveBeenCalledWith(event)
    expect(spawnMock).toHaveBeenCalledWith(
      'node',
      ['/dist/console.mjs', ...process.argv.slice(2)],
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

    const cmd = new CustomCommand(context)
    await cmd.handle(event)

    expect(fallbackStep).toHaveBeenCalledWith(event)
    expect(consoleStep).not.toHaveBeenCalled()
  })

  it('should skip build and only start process', async () => {
    const utils = await import('../../src/utils')
    vi.mocked(utils.shouldBuild).mockReturnValue(false)

    const cmd = new CustomCommand(context)
    await cmd.handle(event)

    expect(consoleStep).not.toHaveBeenCalled()
    expect(fallbackStep).not.toHaveBeenCalled()
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
