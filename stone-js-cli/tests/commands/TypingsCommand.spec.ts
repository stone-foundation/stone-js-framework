import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'

vi.mock('../../src/utils', async () => {
  const actual = await vi.importActual<any>('../../src/utils')
  return {
    ...actual,
    isTypescriptApp: vi.fn(),
    setupProcessSignalHandlers: vi.fn()
  }
})

vi.mock('@stone-js/filesystem', () => ({
  nodeModulesPath: vi.fn()
}))

describe('TypingsCommand', async () => {
  let TypingsCommand: any
  let typingsCommandOptions: any
  let spawnMock: any
  let nodeModulesPath: any
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

    const mod = await import('../../src/commands/TypingsCommand')
    TypingsCommand = mod.TypingsCommand
    typingsCommandOptions = mod.typingsCommandOptions

    nodeModulesPath = (await import('@stone-js/filesystem')).nodeModulesPath
    const utils = await import('../../src/utils')
    vi.mocked(utils.isTypescriptApp).mockReturnValue(true)

    nodeModulesPath.mockReturnValue('/my/project/node_modules/.bin/tsc')

    context = {
      blueprint: {}
    }

    event = {
      type: 'cli',
      payload: {},
      get: vi.fn()
    } as unknown as IncomingEvent
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should spawn tsc with --noEmit when not in watch mode', async () => {
    event.get = vi.fn().mockReturnValue(false)

    const cmd = new TypingsCommand(context)
    await cmd.handle(event)

    expect(spawnMock).toHaveBeenCalledWith(
      'node',
      ['/my/project/node_modules/.bin/tsc', '--noEmit'],
      { stdio: 'inherit' }
    )
  })

  it('should spawn tsc with --watch when watch is true', async () => {
    event.get = vi.fn().mockReturnValue(true)

    const cmd = new TypingsCommand(context)
    await cmd.handle(event)

    expect(spawnMock).toHaveBeenCalledWith(
      'node',
      ['/my/project/node_modules/.bin/tsc', '--noEmit', '--watch'],
      { stdio: 'inherit' }
    )
  })

  it('should skip process spawn if not a typescript app', async () => {
    const utils = await import('../../src/utils')
    vi.mocked(utils.isTypescriptApp).mockReturnValue(false)

    const cmd = new TypingsCommand(context)
    await cmd.handle(event)

    expect(spawnMock).not.toHaveBeenCalled()
  })

  it('should define correct CLI metadata', () => {
    expect(typingsCommandOptions.name).toBe('typings')
    expect(typingsCommandOptions.alias).toBe('t')
    expect(typingsCommandOptions.desc).toBe('Check code typings for typescript')
  })

  it('should configure yargs options correctly with cast', () => {
    const yargs = {
      option: vi.fn().mockReturnThis()
    }

    const fn = typingsCommandOptions.options as ((args: Argv<any>) => Argv<any>)
    const result = fn(yargs as any)

    expect(yargs.option).toHaveBeenCalledWith('watch', {
      alias: 'w',
      type: 'boolean',
      default: false,
      desc: 'Launch checker in watch mode for Typescript'
    })

    expect(result).toBe(yargs)
  })
})
