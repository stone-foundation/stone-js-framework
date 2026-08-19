import { EventEmitter } from 'node:events'
import { CliError } from '../../src/errors/CliError'
import { APP_MODULES_PATTERN_ENV, TestCommand, testCommandOptions } from '../../src/commands/TestCommand'

const spawnMock = vi.fn()
const getEnvVariables = vi.fn()
const outputFileSync = vi.fn()
const pathExistsSync = vi.fn(() => true)

vi.mock('cross-spawn', () => ({ default: (...args: any[]) => spawnMock(...args) }))
vi.mock('fs-extra', () => ({
  default: {
    outputFileSync: (...args: any[]) => outputFileSync(...args),
    pathExistsSync: (...args: any[]) => pathExistsSync(...args)
  }
}))
vi.mock('../../src/utils', async (mod) => ({
  ...(await mod<any>()),
  getEnvVariables: (...args: any[]) => getEnvVariables(...args),
  isReactApp: () => false,
  setupProcessSignalHandlers: vi.fn()
}))
vi.mock('@stone-js/filesystem', async (mod) => ({
  ...(await mod<any>()),
  basePath: (p = '') => `/base/${p}`,
  buildPath: (p = '') => `/base/.stone/${p}`
}))

/**
 * A spawn implementation returning a runner that closes with `code`.
 *
 * The event is emitted when the runner is spawned, not when the fake is built: emitting earlier would
 * fire before the command attaches its listeners, and every test would hang instead of failing.
 */
const runnerExiting = (code: number | null) => () => {
  const child: any = new EventEmitter()
  queueMicrotask(() => child.emit('close', code))
  return child
}

/** A spawn implementation returning a runner that never starts. */
const runnerFailingWith = (message: string) => () => {
  const child: any = new EventEmitter()
  queueMicrotask(() => child.emit('error', new Error(message)))
  return child
}

const makeContext = (test: Record<string, unknown> = {}): any => ({
  blueprint: {
    get: vi.fn((key: string, fallback: any) => (key === 'stone.builder.test' ? test : fallback))
  },
  commandOutput: { info: vi.fn(), error: vi.fn() }
})

const makeEvent = (values: Record<string, unknown> = {}): any => ({
  get: (key: string, fallback?: unknown) => values[key] ?? fallback
})

/** The generated config, as an object, so a test asserts on meaning rather than on formatting. */
const generatedConfig = (): any => {
  const source: string = outputFileSync.mock.calls[0][1]
  return JSON.parse(source.slice(source.indexOf('  test: ') + 8, source.lastIndexOf('\n})')))
}

describe('TestCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pathExistsSync.mockReturnValue(true)
    delete process.env[APP_MODULES_PATTERN_ENV]
    spawnMock.mockImplementation(runnerExiting(0))
  })

  it('is registered as `stone test`, and owns `-t`', () => {
    // `-t` goes to the command a developer types all day; `stone typings` answers to `-ty`.
    expect(testCommandOptions).toEqual(expect.objectContaining({ name: 'test', alias: 't' }))
  })

  it('loads the env file before the runner starts', async () => {
    // The whole reason this lives in the CLI: a value read at module load (a `@Configuration` calling
    // `getString`) only sees the file if it was loaded before the runner imported anything.
    await new TestCommand(makeContext()).handle(makeEvent())

    expect(getEnvVariables).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/base/.env.test', override: true })
    )
    expect(getEnvVariables.mock.invocationCallOrder[0]).toBeLessThan(spawnMock.mock.invocationCallOrder[0])
  })

  it('honours a configured env file', async () => {
    await new TestCommand(makeContext({ envFile: '.env.e2e' })).handle(makeEvent())

    expect(getEnvVariables).toHaveBeenCalledWith(expect.objectContaining({ path: '/base/.env.e2e' }))
  })

  it('hands the app pattern to the test process, so one config file is enough', async () => {
    await new TestCommand(makeContext({ pattern: 'src/**/*.ts' })).handle(makeEvent())

    expect(process.env[APP_MODULES_PATTERN_ENV]).toBe('src/**/*.ts')
  })

  it('falls back to whatever the build scans', async () => {
    // Not a separate default: the suite boots what ships.
    await new TestCommand(makeContext()).handle(makeEvent())

    expect(process.env[APP_MODULES_PATTERN_ENV]).toBe('app/**/*.{ts,tsx,js,jsx,mjsx}')
  })

  it('generates the runner config into .stone/, with what a Stone.js app needs', async () => {
    await new TestCommand(makeContext()).handle(makeEvent())

    expect(outputFileSync.mock.calls[0][0]).toBe('/base/.stone/vitest.config.mjs')
    expect(generatedConfig()).toEqual(expect.objectContaining({ globals: true, environment: 'node' }))
    expect(generatedConfig().coverage).toEqual(expect.objectContaining({ include: ['app/**/*.ts'] }))
  })

  it('lets stone.config.mjs override any of it, exactly as vite and rollup are overridden', async () => {
    // How a frontend project switches to a DOM environment for component tests.
    await new TestCommand(makeContext({ vitest: { environment: 'happy-dom' } })).handle(makeEvent())

    expect(generatedConfig().environment).toBe('happy-dom')
  })

  it("runs the project's own runner, on the generated config, with the filters passed", async () => {
    await new TestCommand(makeContext()).handle(makeEvent({ filters: ['tasks'], coverage: true }))

    const [bin, args] = spawnMock.mock.calls[0]
    expect(bin).toBe('/base/node_modules/.bin/vitest')
    expect(args).toEqual(['run', '--config', '/base/.stone/vitest.config.mjs', '--coverage', 'tasks'])
  })

  it('watches instead of running once', async () => {
    await new TestCommand(makeContext()).handle(makeEvent({ watch: true }))

    expect(spawnMock.mock.calls[0][1][0]).toBe('watch')
  })

  it('fails the command when tests fail, so CI sees it', async () => {
    spawnMock.mockImplementation(runnerExiting(1))

    await expect(new TestCommand(makeContext()).handle(makeEvent()))
      .rejects.toThrow(/Tests failed \(exit code 1\)/)
  })

  it('treats a killed runner as a failure', async () => {
    // A null code means the process was signalled; that is not a pass.
    spawnMock.mockImplementation(runnerExiting(null))

    await expect(new TestCommand(makeContext()).handle(makeEvent())).rejects.toThrow(CliError)
  })

  it('does not fail a watch run that ended with failures on screen', async () => {
    // Watch mode ends when the developer stops it; that is not a failed command.
    spawnMock.mockImplementation(runnerExiting(1))

    await expect(new TestCommand(makeContext()).handle(makeEvent({ watch: true }))).resolves.toBeUndefined()
  })

  it('says what to install when the runner is absent, and spawns nothing', async () => {
    pathExistsSync.mockReturnValue(false)

    await expect(new TestCommand(makeContext()).handle(makeEvent())).rejects.toThrow(/npm i -D vitest/)
    expect(spawnMock).not.toHaveBeenCalled()
  })

  it('reports a runner that could not be launched at all', async () => {
    spawnMock.mockImplementation(runnerFailingWith('EACCES'))

    await expect(new TestCommand(makeContext()).handle(makeEvent()))
      .rejects.toThrow(/Could not start the test runner: EACCES/)
  })

  it('reports a launch failure that carries no message', async () => {
    spawnMock.mockImplementation(runnerFailingWith(''))

    await expect(new TestCommand(makeContext()).handle(makeEvent())).rejects.toThrow(/unknown error/)
  })
})

describe('testCommandOptions', () => {
  it('declares the flags a test run needs', () => {
    // The yargs builder is what the shell actually talks to, so it is worth exercising.
    const calls: string[] = []
    const yargs: any = {
      positional: (name: string) => { calls.push(`positional:${name}`); return yargs },
      option: (name: string) => { calls.push(`option:${name}`); return yargs }
    }

    testCommandOptions.options?.(yargs)

    expect(calls).toEqual(['positional:filters', 'option:watch', 'option:coverage'])
  })
})
