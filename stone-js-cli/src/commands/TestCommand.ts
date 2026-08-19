import { Argv } from 'yargs'
import deepmerge from 'deepmerge'
import { CliError } from '../errors/CliError'
import { ConsoleContext } from '../declarations'
import { TestConfig } from '../options/BuilderConfig'
import { IncomingEvent, isNotEmpty } from '@stone-js/core'
import { CommandOptions } from '@stone-js/node-cli-adapter'
import { getEnvVariables, isReactApp } from '../utils'
import { basePath, DEFAULT_APP_MODULES_PATTERN } from '@stone-js/filesystem'

/**
 * The env variable the test process reads to discover the app's modules.
 *
 * This is how `createTestApp()` in `@stone-js/testing` ends up scanning exactly what the build
 * scans: the value is resolved here, from the one config file, and handed to the runner. A test suite
 * therefore cannot boot a different application than the one that ships.
 */
export const APP_MODULES_PATTERN_ENV = 'STONE_APP_MODULES_PATTERN'

/**
 * The part of Vitest this command depends on.
 *
 * Declared structurally, and deliberately small: the runner is resolved from the application at run
 * time, so the less of its surface this names, the fewer versions of it can break the command.
 */
interface TestRunner {
  state: { getCountOfFailedTests: () => number }
  close: () => Promise<void>
}

/** Vitest's programmatic entry point, as this command uses it. */
type StartVitest = (
  mode: string,
  filters: string[],
  config: Record<string, unknown>
) => Promise<TestRunner | undefined>

/**
 * The test command options.
 */
export const testCommandOptions: CommandOptions = {
  name: 'test',
  alias: 't',
  args: ['[filters..]'],
  desc: 'Run the test suite',
  options: (yargs: Argv) => {
    return yargs
      .positional('filters', {
        type: 'string',
        desc: 'only run test files matching these names'
      })
      .option('watch', {
        alias: 'w',
        type: 'boolean',
        desc: 're-run tests when files change'
      })
      .option('coverage', {
        alias: 'c',
        type: 'boolean',
        desc: 'collect coverage'
      })
  }
}

/**
 * Run the test suite, configured from `stone.config.mjs`.
 *
 * Tests are a context like any other, so they are configured where every other context is: the same
 * file that shapes the build shapes the test run, and a project needs no second config file to keep
 * in sync with the first. The runner is Vitest, driven in-process.
 *
 * Two things this does that a bare `vitest` cannot:
 *
 * - It loads the env files **before** the runner starts, so a value read at module load (a
 *   `@Configuration` calling `getString`) sees it. Loading the same file from inside a test would be
 *   too late: the imports have already run.
 * - It resolves which files make up the app and hands that to the test process, so
 *   `createTestApp()` discovers the same modules the build does.
 */
export class TestCommand {
  /**
   * Create a new instance of TestCommand.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {}

  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   * @throws {CliError} When Vitest is not installed, or when tests fail.
   */
  async handle (event: IncomingEvent): Promise<void> {
    const config = this.context.blueprint.get<TestConfig>('stone.builder.test', {})

    this.loadEnvironment(config)

    const startVitest = await this.resolveRunner()
    const filters = event.get<string[]>('filters', [])

    const vitest = await startVitest(
      'test',
      filters,
      deepmerge(this.defaults(event, config), config.vitest ?? {})
    )

    // `startVitest` resolves to undefined when the run cannot start at all.
    if (vitest === undefined) {
      throw new CliError('The test runner could not be started.')
    }

    const failed = vitest.state.getCountOfFailedTests()

    await vitest.close()

    // Watch mode ends when the user stops it, so a run that was interrupted is not a failure.
    if (failed > 0 && !event.get<boolean>('watch', false)) {
      throw new CliError(`${failed} test(s) failed.`)
    }
  }

  /**
   * Load the env files before the runner starts.
   *
   * @param config - The test config.
   */
  private loadEnvironment (config: TestConfig): void {
    const pattern = this.context.blueprint.get<string>('stone.builder.input.all', DEFAULT_APP_MODULES_PATTERN)

    // Read by `@stone-js/testing`'s discovery, so the suite boots what the build builds.
    process.env[APP_MODULES_PATTERN_ENV] = config.pattern ?? pattern

    // `override: true` on purpose: `.env` is already loaded by the time a command runs, and a
    // test-specific file that could not win over it would have no purpose.
    getEnvVariables({ path: basePath(config.envFile ?? '.env.test'), override: true, expand: true })
  }

  /**
   * The config a Stone.js app needs, before the user's own.
   *
   * Coverage follows what the app is: a React project has `.tsx` to account for, a service does not.
   *
   * @param event - The incoming event.
   * @param config - The test config.
   * @returns The default Vitest config.
   */
  private defaults (event: IncomingEvent, config: TestConfig): Record<string, unknown> {
    const app = isReactApp(this.context.blueprint, event) ? ['app/**/*.ts', 'app/**/*.tsx'] : ['app/**/*.ts']

    return {
      watch: event.get<boolean>('watch', false),
      globals: true,
      environment: 'node',
      include: config.include ?? ['./tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      coverage: {
        enabled: event.get<boolean>('coverage', false),
        provider: 'v8',
        include: app,
        reporter: ['text', 'html'],
        reportsDirectory: './coverage'
      }
    }
  }

  /**
   * Resolve Vitest from the project.
   *
   * Imported lazily, and from the application rather than bundled here: a project pins its own
   * runner version, and a project that does not test should not carry one at all.
   *
   * @returns Vitest's programmatic entry point.
   * @throws {CliError} When Vitest is not installed.
   */
  private async resolveRunner (): Promise<StartVitest> {
    try {
      const { startVitest } = await import('vitest/node')
      return startVitest as unknown as StartVitest
    } catch (error: any) {
      throw new CliError(
        '`stone test` runs your suite with Vitest, which is not installed in this project.\n' +
        'Add it with `npm i -D vitest @vitest/coverage-v8`.\n' +
        `Cause: ${String(isNotEmpty<Error>(error) ? error.message : error)}`
      )
    }
  }
}
