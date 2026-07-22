import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'

vi.mock('../../src/utils', async () => {
  const actual = await vi.importActual<any>('../../src/utils')
  return {
    ...actual,
    isReactApp: vi.fn()
  }
})

const ReactBuilderDev = vi.fn()
const ServerBuilderDev = vi.fn()
const ServerBuilderWatchFiles = vi.fn()

vi.mock('../../src/react/ReactBuilder', () => ({
  ReactBuilder: class {
    dev = ReactBuilderDev
  }
}))

vi.mock('../../src/server/ServerBuilder', () => ({
  ServerBuilder: class {
    dev = ServerBuilderDev
    watchFiles = ServerBuilderWatchFiles
  }
}))

const pmStart = vi.fn()
const pmRestart = vi.fn()
const pmCreate = vi.fn(() => ({ start: pmStart, restart: pmRestart }))

vi.mock('../../src/server/ProcessManager', () => ({
  ProcessManager: { create: pmCreate }
}))

vi.mock('@stone-js/filesystem', () => ({
  buildPath: vi.fn(() => '/dist/server.mjs')
}))

// A chalk-like formatter: every color is a callable that also carries `.bold`; `hex(color)`
// returns a colour so `hex('#rrggbb').bold(text)` works too.
const makeColor = (): any => Object.assign((s: string) => s, { bold: (s: string) => s })
const format = new Proxy({}, { get: (_t, prop) => prop === 'hex' ? (() => makeColor()) : makeColor() })

const createContext = (): any => {
  const spinner = { succeed: vi.fn(), fail: vi.fn() }
  return {
    spinner,
    blueprint: { get: vi.fn(() => '') },
    commandOutput: {
      show: vi.fn(),
      breakLine: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      succeed: vi.fn(),
      spin: vi.fn(() => spinner),
      format
    }
  }
}

describe('ServeCommand', () => {
  let ServeCommand: any
  let serveCommandOptions: any
  let context: any
  let event: IncomingEvent

  beforeEach(async () => {
    vi.clearAllMocks()

    const mod = await import('../../src/commands/ServeCommand')
    ServeCommand = mod.ServeCommand
    serveCommandOptions = mod.serveCommandOptions

    const utils = await import('../../src/utils')
    vi.mocked(utils.isReactApp).mockReturnValue(true)

    context = createContext()
    event = { type: 'cli', payload: {} } as unknown as IncomingEvent
  })

  it('should start the react dev server and launch the supervised process', async () => {
    const cmd = new ServeCommand(context)
    await cmd.handle(event)

    expect(ReactBuilderDev).toHaveBeenCalledWith(event)
    expect(pmCreate).toHaveBeenCalledWith(expect.objectContaining({
      command: 'node',
      args: ['/dist/server.mjs', ...process.argv.slice(2)]
    }))
    expect(pmStart).toHaveBeenCalled()
  })

  it('should build, launch and watch for the backend dev server', async () => {
    const utils = await import('../../src/utils')
    vi.mocked(utils.isReactApp).mockReturnValue(false)

    const cmd = new ServeCommand(context)
    await cmd.handle(event)

    expect(ServerBuilderDev).toHaveBeenCalledWith(event)
    expect(context.commandOutput.spin).toHaveBeenCalledWith('Building application…')
    expect(context.spinner.succeed).toHaveBeenCalled()
    expect(ServerBuilderWatchFiles).toHaveBeenCalled()
    expect(pmStart).toHaveBeenCalled()

    // Backend onExit: a crash keeps the watcher alive with a warning; a clean exit is silent.
    const onExit = pmCreate.mock.calls[0][0].onExit
    onExit(1)
    expect(context.commandOutput.warn).toHaveBeenCalledWith(expect.stringContaining('Server exited'))
    context.commandOutput.warn.mockClear()
    onExit(0)
    expect(context.commandOutput.warn).not.toHaveBeenCalled()
  })

  it('should mirror the child exit code for the react dev server', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((): never => undefined as never))
    context.blueprint.get.mockReturnValueOnce(undefined) // version resolves to '' via ?? fallback

    const cmd = new ServeCommand(context)
    await cmd.handle(event)

    const onExit = pmCreate.mock.calls[0][0].onExit
    onExit(2)
    expect(exitSpy).toHaveBeenCalledWith(2)
    onExit(null) // null → 0 via ?? fallback
    expect(exitSpy).toHaveBeenCalledWith(0)
    exitSpy.mockRestore()
  })

  it('should report a failed first build and not watch', async () => {
    const utils = await import('../../src/utils')
    vi.mocked(utils.isReactApp).mockReturnValue(false)
    ServerBuilderDev.mockRejectedValueOnce('boom') // non-Error → exercises the `?? error` fallback

    const cmd = new ServeCommand(context)
    await cmd.handle(event)

    expect(context.spinner.fail).toHaveBeenCalled()
    expect(context.commandOutput.error).toHaveBeenCalledWith('boom')
    expect(ServerBuilderWatchFiles).not.toHaveBeenCalled()
  })

  it('should rebuild and restart on a file change, and report a rebuild error', async () => {
    const utils = await import('../../src/utils')
    vi.mocked(utils.isReactApp).mockReturnValue(false)

    const cmd = new ServeCommand(context)
    await cmd.handle(event)

    const cb = ServerBuilderWatchFiles.mock.calls[0][0]

    // Successful live-reload cycle
    await cb('app/User.ts', 1)
    expect(ServerBuilderDev).toHaveBeenCalledWith(event, true)
    expect(pmRestart).toHaveBeenCalled()
    expect(context.commandOutput.succeed).toHaveBeenCalled()

    // Failed live-reload cycle (non-Error rejection → `?? error` fallback)
    ServerBuilderDev.mockRejectedValueOnce('fail')
    await cb('app/User.ts', 2)
    expect(context.commandOutput.error).toHaveBeenCalledWith(expect.stringContaining('Rebuild failed: fail'))
  })

  it('should expose correct command metadata and yargs options', () => {
    expect(serveCommandOptions.name).toBe('serve')
    expect(serveCommandOptions.alias).toBe('dev')
    expect(serveCommandOptions.args).toEqual(['[target]'])
    expect(serveCommandOptions.desc).toBe('Run project in dev mode')
  })

  it('should configure yargs options correctly with cast', () => {
    const yargs = {
      positional: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis()
    }

    const fn = serveCommandOptions.options as ((args: Argv<any>) => Argv<any>)
    const result = fn(yargs as any)

    expect(yargs.positional).toHaveBeenCalledWith('target', {
      type: 'string',
      desc: 'app target to serve',
      choices: ['server', 'react']
    })
    expect(yargs.option).toHaveBeenCalledWith('language', {
      alias: 'lang',
      type: 'string',
      desc: 'language to use',
      choices: ['javascript', 'typescript']
    })
    expect(yargs.option).toHaveBeenCalledWith('rendering', {
      alias: 'r',
      type: 'string',
      desc: 'web rendering type',
      choices: ['csr', 'ssr']
    })
    expect(yargs.option).toHaveBeenCalledWith('imperative', {
      alias: 'i',
      type: 'boolean',
      desc: 'imperative api'
    })
    expect(result).toBe(yargs)
  })
})
