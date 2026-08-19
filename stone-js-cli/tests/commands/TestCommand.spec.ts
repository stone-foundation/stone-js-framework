import { CliError } from '../../src/errors/CliError'
import { APP_MODULES_PATTERN_ENV, TestCommand, testCommandOptions } from '../../src/commands/TestCommand'

const startVitest = vi.fn()
const getEnvVariables = vi.fn()

vi.mock('vitest/node', () => ({ startVitest: (...args: any[]) => startVitest(...args) }))
vi.mock('../../src/utils', async (mod) => ({
  ...(await mod<any>()),
  getEnvVariables: (...args: any[]) => getEnvVariables(...args),
  isReactApp: () => false
}))
vi.mock('@stone-js/filesystem', async (mod) => ({
  ...(await mod<any>()),
  basePath: (p = '') => `/base/${p}`
}))

const makeContext = (test: Record<string, unknown> = {}): any => ({
  blueprint: {
    get: vi.fn((key: string, fallback: any) => (key === 'stone.builder.test' ? test : fallback))
  },
  commandOutput: { info: vi.fn(), error: vi.fn() }
})

const makeEvent = (values: Record<string, unknown> = {}): any => ({
  get: (key: string, fallback?: unknown) => values[key] ?? fallback
})

/** A Vitest instance that reports `failed` failures. */
const vitestReporting = (failed: number): any => ({
  state: { getCountOfFailedTests: () => failed },
  close: vi.fn()
})

describe('TestCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env[APP_MODULES_PATTERN_ENV]
    startVitest.mockResolvedValue(vitestReporting(0))
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
    // Loaded before Vitest is started, not after.
    expect(getEnvVariables.mock.invocationCallOrder[0]).toBeLessThan(startVitest.mock.invocationCallOrder[0])
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

  it('runs with the config a Stone.js app needs, and the filters the user passed', async () => {
    await new TestCommand(makeContext()).handle(makeEvent({ filters: ['tasks'], coverage: true }))

    const [mode, filters, config] = startVitest.mock.calls[0]
    expect(mode).toBe('test')
    expect(filters).toEqual(['tasks'])
    expect(config).toEqual(expect.objectContaining({ globals: true, environment: 'node' }))
    expect(config.coverage).toEqual(expect.objectContaining({ enabled: true, include: ['app/**/*.ts'] }))
  })

  it('lets stone.config.mjs override any of it, exactly as vite and rollup are overridden', async () => {
    // How a frontend project switches to a DOM environment for component tests.
    await new TestCommand(makeContext({ vitest: { environment: 'happy-dom' } })).handle(makeEvent())

    expect(startVitest.mock.calls[0][2]).toEqual(expect.objectContaining({ environment: 'happy-dom' }))
  })

  it('fails the command when tests fail, so CI sees it', async () => {
    startVitest.mockResolvedValue(vitestReporting(2))

    await expect(new TestCommand(makeContext()).handle(makeEvent())).rejects.toThrow(/2 test\(s\) failed/)
  })

  it('does not fail a watch run that ended with failures on screen', async () => {
    // Watch mode ends when the developer stops it; that is not a failed command.
    startVitest.mockResolvedValue(vitestReporting(2))

    await expect(new TestCommand(makeContext()).handle(makeEvent({ watch: true }))).resolves.toBeUndefined()
  })

  it('closes the runner even when the run failed', async () => {
    const vitest = vitestReporting(1)
    startVitest.mockResolvedValue(vitest)

    await expect(new TestCommand(makeContext()).handle(makeEvent())).rejects.toThrow(CliError)
    expect(vitest.close).toHaveBeenCalled()
  })

  it('reports a runner that could not start', async () => {
    startVitest.mockResolvedValue(undefined)

    await expect(new TestCommand(makeContext()).handle(makeEvent()))
      .rejects.toThrow(/could not be started/)
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
