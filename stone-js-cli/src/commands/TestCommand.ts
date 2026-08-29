import { Argv } from 'yargs'
import fsExtra from 'fs-extra'
import spawn from 'cross-spawn'
import { CliError } from '../errors/CliError'
import { ConsoleContext } from '../declarations'
import { ChildProcess } from 'node:child_process'
import { TestConfig } from '../options/BuilderConfig'
import { CommandOptions } from '@stone-js/node-cli-adapter'
import { IncomingEvent, isNotEmpty } from '@stone-js/core'
import { getEnvVariables, isReactApp, setupProcessSignalHandlers } from '../utils'
import { basePath, buildPath, DEFAULT_APP_MODULES_PATTERN } from '@stone-js/filesystem'

const { outputFileSync, pathExistsSync } = fsExtra

/**
 * The env variable the test process reads to discover the app's modules.
 *
 * This is how `createTestApp()` in `@stone-js/testing` ends up scanning exactly what the build
 * scans: the value is resolved here, from the one config file, and handed to the runner. A test suite
 * therefore cannot boot a different application than the one that ships.
 */
export const APP_MODULES_PATTERN_ENV = 'STONE_APP_MODULES_PATTERN'

/** Where the generated runner config is written. Inspectable, and regenerated on every run. */
export const GENERATED_CONFIG = 'vitest.config.mjs'

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
 * in sync with the first. The runner is Vitest.
 *
 * Two things this does that a bare runner cannot:
 *
 * - It loads the env files **before** the runner starts, so a value read at module load (a
 *   `@Configuration` calling `getString`) sees it. Loading the same file from inside a test would be
 *   too late: the imports have already run.
 * - It resolves which files make up the app and hands that to the test process, so
 *   `createTestApp()` discovers the same modules the build does.
 *
 * The runner is **spawned, not imported**. Importing it joined two module graphs: this package is
 * bundled, so a runner it does not depend on was bundled with it and broke in ways that had nothing
 * to do with the project's tests. A child process also owns its own exit code and its own watch loop,
 * which is what a test command actually needs.
 */
export class TestCommand {
  private runner?: ChildProcess

  /**
   * Create a new instance of TestCommand.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {
    setupProcessSignalHandlers(() => this.runner)
  }

  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   * @throws {CliError} When the runner is missing, or when tests fail.
   */
  async handle (event: IncomingEvent): Promise<void> {
    const config = this.context.blueprint.get<TestConfig>('stone.builder.test', {})

    this.loadEnvironment(config)

    const configPath = this.writeRunnerConfig(event, config)
    const code = await this.run(this.resolveRunner(), this.argsFor(event, configPath))

    // A watch run ends when the developer stops it, so its exit code is not a verdict on the tests.
    if (code !== 0 && !event.get<boolean>('watch', false)) {
      throw new CliError(`Tests failed (exit code ${String(code)}).`)
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
   * Generate the runner config into `.stone/`, and return its path.
   *
   * Written to disk because the runner is a separate process, and left there on purpose: when a run
   * behaves unexpectedly, the exact config it used is readable.
   *
   * @param event - The incoming event.
   * @param config - The test config.
   * @returns The generated file's path.
   */
  private writeRunnerConfig (event: IncomingEvent, config: TestConfig): string {
    const path = buildPath(GENERATED_CONFIG)
    // Coverage follows what the app is: a React project has `.tsx` to account for, a service does not.
    const app = isReactApp(this.context.blueprint, event) ? ['app/**/*.ts', 'app/**/*.tsx'] : ['app/**/*.ts']

    const defaults = {
      globals: true,
      environment: 'node',
      // `createTestApp()` discovers the application's modules by importing them at run time. Vitest
      // externalises dependencies that come from `node_modules`, and an externalised module's
      // `import()` is Node's own, which cannot load a `.ts` or `.tsx` file: discovery fails with
      // "Unknown file extension". Inlining the package puts those imports back through Vite's
      // transform, which is what makes them loadable.
      //
      // Invisible inside this repository, and that is exactly why it shipped: a workspace link is
      // inlined by default, so the lab apps and the framework's own suites never saw it. A project
      // installing from the registry saw nothing else.
      //
      // Matched as a substring, and never as a regular expression: this object is written out as JSON,
      // where a `RegExp` becomes `{}` and the runner then finds no tests at all. Every framework
      // package is covered rather than just this one, because any of them importing your source at
      // run time meets the same wall.
      server: { deps: { inline: ['@stone-js/'] } },
      include: config.include ?? ['./tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      coverage: {
        provider: 'v8',
        include: app,
        reporter: ['text', 'html'],
        reportsDirectory: './coverage'
      }
    }

    outputFileSync(path, [
      '// Generated by `stone test` from stone.config.mjs. Edits here are overwritten on every run.',
      "import { defineConfig } from 'vitest/config'",
      '',
      'export default defineConfig({',
      `  root: ${JSON.stringify(basePath())},`,
      // A project's tsconfig says `experimentalDecorators: true`, which is what TypeScript's own
      // checker wants, and Stone.js applies stage-3 semantics after the build. A test runner
      // transpiles instead of building, so it would emit the legacy form and the framework would
      // reject it at run time. Pinned here rather than in every project's tsconfig, so the two
      // audiences each get what they need and nobody has to know why.
      `  esbuild: ${JSON.stringify(this.decoratorSemantics(), null, 2)},`,
      `  test: ${JSON.stringify({ ...defaults, ...config.vitest }, null, 2)}`,
      '})',
      ''
    ].join('\n'), 'utf-8')

    return path
  }

  /**
   * The decorator semantics the framework runs on, forced onto the runner's transformer.
   *
   * Stone.js decorators are TC39 stage-3: they read `Symbol.metadata`, and the legacy form does not
   * produce it. A project's `tsconfig.json` keeps `experimentalDecorators: true` for TypeScript's
   * checker, and the build applies stage-3 afterwards; a test runner has no build step, so without
   * this it would emit the legacy form and every decorated class would fail to boot.
   *
   * Only the decorator options are stated. Everything else esbuild reads from the project's own
   * tsconfig, so JSX, target and paths keep working as they do everywhere else.
   *
   * The same value is published as `decoratorSemantics` in `@stone-js/testing/vitest`, for a project
   * that keeps its own runner config. It is written out here rather than imported, because the CLI
   * generating a config must not require a package the project may not have installed; the two are
   * held together by a test on each side.
   *
   * @returns The transformer options.
   */
  private decoratorSemantics (): Record<string, unknown> {
    return { tsconfigRaw: { compilerOptions: { experimentalDecorators: false, useDefineForClassFields: true } } }
  }

  /**
   * The arguments to run the runner with.
   *
   * @param event - The incoming event.
   * @param configPath - The generated config's path.
   * @returns The argument list.
   */
  private argsFor (event: IncomingEvent, configPath: string): string[] {
    return [
      event.get<boolean>('watch', false) ? 'watch' : 'run',
      '--config',
      configPath,
      ...(event.get<boolean>('coverage', false) ? ['--coverage'] : []),
      ...event.get<string[]>('filters', [])
    ]
  }

  /**
   * Resolve the runner's executable from the project.
   *
   * @returns The path to the runner.
   * @throws {CliError} When it is not installed.
   */
  private resolveRunner (): string {
    const bin = basePath('node_modules/.bin/vitest')

    if (!pathExistsSync(bin)) {
      throw new CliError(
        '`stone test` runs your suite with Vitest, which is not installed in this project.\n' +
        'Add it with `npm i -D vitest @vitest/coverage-v8`.'
      )
    }

    return bin
  }

  /**
   * Run the runner to completion.
   *
   * @param bin - The runner's executable.
   * @param args - The arguments.
   * @returns Its exit code.
   */
  private async run (bin: string, args: string[]): Promise<number> {
    // One exit path: the runner either fails to launch or closes with a code, and both are values
    // rather than a rejection, so the error is raised here where the message belongs.
    const outcome = await new Promise<number | Error>((resolve) => {
      this.runner = spawn(bin, args, { stdio: 'inherit', cwd: basePath() })
      this.runner.on('error', (error: Error) => resolve(error))
      this.runner.on('close', (code: number | null) => resolve(code ?? 1))
    })

    if (outcome instanceof Error) {
      const cause = isNotEmpty<string>(outcome.message) ? outcome.message : 'unknown error'
      throw new CliError(`Could not start the test runner: ${cause}`)
    }

    return outcome
  }
}
