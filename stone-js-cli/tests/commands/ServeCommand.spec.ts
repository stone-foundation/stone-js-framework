import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'

vi.mock('../../src/utils', async () => {
  const actual = await vi.importActual<any>('../../src/utils')
  return {
    ...actual,
  }
})

const selfHostedDev = vi.fn()
const supervisedDev = vi.fn()
const supervisedWatchFiles = vi.fn()

/**
 * Two registered targets, one of each supervision kind. The command must branch on the
 * declared capability, never on a target's name, which is what these two cover.
 */
const builderRegistry = (devMode: 'self-hosted' | 'supervised'): any => ({
  only: {
    target: devMode === 'self-hosted' ? 'react' : 'server',
    devMode,
    match: () => true,
    resolver: () => devMode === 'self-hosted'
      ? { dev: selfHostedDev }
      : { dev: supervisedDev, watchFiles: supervisedWatchFiles }
  }
})

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
    blueprint: { get: vi.fn((key: string) => key === 'stone.builder.builders' ? builderRegistry('self-hosted') : '') },
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

    context = createContext()
    event = { type: 'cli', payload: {}, get: vi.fn(), is: vi.fn() } as unknown as IncomingEvent
  })

  it('launches a self-hosted dev server and follows it', async () => {
    const cmd = new ServeCommand(context)
    await cmd.handle(event)

    expect(selfHostedDev).toHaveBeenCalledWith(event)
    expect(pmCreate).toHaveBeenCalledWith(expect.objectContaining({
      command: 'node',
      args: ['/dist/server.mjs', ...process.argv.slice(2)]
    }))
    expect(pmStart).toHaveBeenCalled()
  })

  it('builds, launches and watches a supervised dev server', async () => {
    context.blueprint.get = vi.fn((key: string) => key === 'stone.builder.builders' ? builderRegistry('supervised') : '')

    const cmd = new ServeCommand(context)
    await cmd.handle(event)

    expect(supervisedDev).toHaveBeenCalledWith(event)
    expect(context.commandOutput.spin).toHaveBeenCalledWith('Building application…')
    expect(context.spinner.succeed).toHaveBeenCalled()
    expect(supervisedWatchFiles).toHaveBeenCalled()
    expect(pmStart).toHaveBeenCalled()

    // Backend onExit: a crash keeps the watcher alive with a warning; a clean exit is silent.
    const onExit = pmCreate.mock.calls[0][0].onExit
    onExit(1)
    expect(context.commandOutput.warn).toHaveBeenCalledWith(expect.stringContaining('Server exited'))
    context.commandOutput.warn.mockClear()
    onExit(0)
    expect(context.commandOutput.warn).not.toHaveBeenCalled()
  })

  it('mirrors the child exit code for a self-hosted dev server', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((): never => undefined as never))
    // version resolves to '' via the ?? fallback; the registry still has to answer.

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
    context.blueprint.get = vi.fn((key: string) => key === 'stone.builder.builders' ? builderRegistry('supervised') : '')
    supervisedDev.mockRejectedValueOnce('boom') // non-Error → exercises the `?? error` fallback

    const cmd = new ServeCommand(context)
    await cmd.handle(event)

    expect(context.spinner.fail).toHaveBeenCalled()
    expect(context.commandOutput.error).toHaveBeenCalledWith('boom')
    expect(supervisedWatchFiles).not.toHaveBeenCalled()
  })

  it('should rebuild and restart on a file change, and report a rebuild error', async () => {
    context.blueprint.get = vi.fn((key: string) => key === 'stone.builder.builders' ? builderRegistry('supervised') : '')

    const cmd = new ServeCommand(context)
    await cmd.handle(event)

    const cb = supervisedWatchFiles.mock.calls[0][0]

    // Successful live-reload cycle
    await cb('app/User.ts', 1)
    expect(supervisedDev).toHaveBeenCalledWith(event, true)
    expect(pmRestart).toHaveBeenCalled()
    expect(context.commandOutput.succeed).toHaveBeenCalled()

    // Failed live-reload cycle (non-Error rejection → `?? error` fallback)
    supervisedDev.mockRejectedValueOnce('fail')
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

    // No `choices`: any registered target is accepted, and an unknown one is rejected by the
    // resolver, which can name the real list.
    expect(yargs.positional).toHaveBeenCalledWith('target', {
      type: 'string',
      desc: 'app target to serve'
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
