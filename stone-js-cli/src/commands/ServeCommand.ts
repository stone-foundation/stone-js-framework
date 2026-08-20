import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'
import { buildPath } from '@stone-js/filesystem'
import { ConsoleContext } from '../declarations'
import { StoneReporter } from '../StoneReporter'
import { ProcessManager } from '../server/ProcessManager'
import { CommandOptions } from '@stone-js/node-cli-adapter'
import { resolveBuilder, resolveBuilderDefinition, runBuilderStep } from '../builders/resolveBuilder'

/**
 * The serve command options.
 */
export const serveCommandOptions: CommandOptions = {
  name: 'serve',
  alias: 'dev',
  args: ['[target]'],
  desc: 'Run project in dev mode',
  options: (yargs: Argv) => {
    return yargs
      .positional('target', {
        type: 'string',
        desc: 'app target to serve'
      })
      .option('language', {
        alias: 'lang',
        type: 'string',
        desc: 'language to use',
        choices: ['javascript', 'typescript']
      })
      .option('rendering', {
        alias: 'r',
        type: 'string',
        desc: 'web rendering type',
        choices: ['csr', 'ssr']
      })
      .option('imperative', {
        alias: 'i',
        type: 'boolean',
        desc: 'imperative api'
      })
  }
}

/**
 * The serve command class.
 *
 * Owns the dev-server lifecycle: it builds once, launches a supervised child process, and — for
 * backend apps — watches the sources to rebuild and restart on change. Console output is
 * context-aware: the first launch shows a banner + build spinner + "watching" hint, while a
 * live-reload cycle shows a concise "changed → rebuilt · restarted" line.
 */
export class ServeCommand {
  private readonly reporter: StoneReporter
  private processManager?: ProcessManager

  /**
   * Create a new instance of ServeCommand.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {
    this.reporter = StoneReporter.create(
      context.commandOutput,
      context.blueprint.get<string>('stone.builder.version', '') ?? ''
    )
  }

  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   */
  async handle (event: IncomingEvent): Promise<void> {
    // Which target answers, and how it wants to be supervised, are the target's business.
    // This command only knows the two ways a dev server can be run.
    const definition = resolveBuilderDefinition(this.context, event)

    if (definition.devMode === 'self-hosted') {
      await this.startSelfHostedServer(event)
    } else {
      await this.startServerAndWatchFiles(event)
    }
  }

  /**
   * Start a dev server that reloads itself (Vite's HMR, Expo's dev server), so no process
   * restart is wired here: the child hot-reloads on its own, and we only launch and follow it.
   *
   * @param event - The incoming event.
   */
  private async startSelfHostedServer (event: IncomingEvent): Promise<void> {
    this.reporter.step('Starting dev server…')

    await runBuilderStep(this.context, event, 'dev')

    // Vite owns HMR; if its dev server exits on its own there is nothing left to do, so mirror
    // its exit code.
    this.launch(buildPath('server.mjs'), process.argv.slice(2), (code) => process.exit(code ?? 0))
    this.reporter.hint('HMR enabled — press Ctrl+C to stop')
  }

  /**
   * Start the backend dev server and watch the sources: rebuild (Rollup) then restart the
   * supervised child on every change.
   *
   * @param event - The incoming event.
   */
  private async startServerAndWatchFiles (event: IncomingEvent): Promise<void> {
    const builder = resolveBuilder(this.context, event)

    this.reporter.step('Starting dev server…')
    const spinner = this.reporter.spin('Building application…')
    const startedAt = Date.now()

    try {
      await builder.dev?.(event)
      const elapsed = `(${Date.now() - startedAt}ms)`
      spinner.succeed(this.context.commandOutput.format.greenBright(
        `Built ${this.context.commandOutput.format.gray(elapsed)}`
      ))
    } catch (error: any) {
      spinner.fail(this.context.commandOutput.format.redBright('Build failed'))
      this.reporter.error(String(error?.message ?? error))
      return
    }

    // First launch prints the URLs (server.dev set printUrls=true); then we watch for changes.
    // If the server crashes on its own, keep the watcher alive so the next edit restarts it.
    this.launch(buildPath('server.mjs'), process.argv.slice(2), (code) => {
      if (code !== null && code !== 0) {
        this.reporter.warn(`Server exited (code ${code}). Waiting for changes to restart…`)
      }
    })
    this.reporter.hint('Watching for changes — press Ctrl+C to stop')

    builder.watchFiles?.(async (path, count) => {
      this.reporter.changed(path, count)
      const rebuiltAt = Date.now()
      try {
        await builder.dev?.(event, true) // restart cycle: printUrls=false (URLs already shown)
        await this.processManager?.restart()
        this.reporter.success('Rebuilt · server restarted', Date.now() - rebuiltAt)
      } catch (error: any) {
        this.reporter.error(`Rebuild failed: ${String(error?.message ?? error)}`)
      }
    })
  }

  /**
   * Launch the supervised child process.
   *
   * @param entry - The entry file to run with Node.
   * @param args - Extra process arguments to forward.
   * @param onExit - Called when the child exits on its own (not during a managed restart/stop).
   */
  private launch (entry: string, args: string[], onExit: (code: number | null) => void): void {
    this.processManager = ProcessManager.create({
      command: 'node',
      args: [entry, ...args],
      onExit
    })
    this.processManager.start()
  }
}
