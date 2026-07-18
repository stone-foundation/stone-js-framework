import { watch } from 'chokidar'
import { dirPath } from '../utils'
import { CliError } from '../errors/CliError'
import { ConsoleContext } from '../declarations'
import { MetaPipe, Pipeline } from '@stone-js/pipeline'
import { basePath, distPath } from '@stone-js/filesystem'
import { IBlueprint, IncomingEvent } from '@stone-js/core'
import { consoleIndexFile, serverIndexFile } from './stubs'
import { ServerBuildMiddleware } from './ServerBuildMiddleware'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { ConsoleDevMiddleware, ServerDevMiddleware } from './ServerDevMiddleware'

/**
 * The Server builder class.
 */
export class ServerBuilder {
  /**
   * Creates a new Server builder instance.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {}

  /**
   * Builds the application.
   *
   * @param _event The incoming event.
   */
  async build (_event: IncomingEvent): Promise<void> {
    await this.executeThroughPipeline(ServerBuildMiddleware)
  }

  /**
   * Starts the development server.
   *
   * @param _event The incoming event.
   * @param restart Whether to restart the server.
   */
  async dev (_event: IncomingEvent, restart?: boolean): Promise<void> {
    this.context.blueprint.set('stone.builder.server.printUrls', restart !== true)
    await this.executeThroughPipeline(ServerDevMiddleware)
  }

  /**
   * Previews the application.
   *
   * @param _event The incoming event.
   */
  preview (_event: IncomingEvent): void {
    // Must match the build output default (ServerBuildMiddleware writes `dist/server.mjs`),
    // otherwise `stone build` then `stone preview` always fails on a default config.
    const output = this.context.blueprint.get('stone.builder.output', 'server.mjs')
    if (!existsSync(distPath(output))) {
      throw new CliError('The application must be built before previewing.')
    }
  }

  /**
   * Runs the application in the console.
   *
   * @param _event The incoming event.
   */
  async console (_event: IncomingEvent): Promise<void> {
    await this.executeThroughPipeline(ConsoleDevMiddleware)
  }

  /**
   * Exports server files.
   *
   * @param event The incoming event.
   */
  async export (event: IncomingEvent): Promise<void> {
    let isExported = false
    const module = event.get<'app' | 'console' | 'rollup'>('module', 'app')
    switch (module) {
      case 'app':
        isExported = await this.exportServerTemplate()
        break
      case 'console':
        isExported = await this.exportConsoleTemplate()
        break
      case 'rollup':
        isExported = await this.exportRollupConfig()
        break
    }

    isExported && this.context.commandOutput.info(`Module(${module}) exported!`)
  }

  /**
   * Watch the application sources and invoke `cb` (debounced) on every change.
   *
   * Only the source root (derived from `stone.builder.input.all`) and the project's config
   * files are watched — not the whole working tree — so a README or `.git/` write never triggers
   * a rebuild. Rapid successive saves are coalesced through a small debounce window so a single
   * multi-file save produces one rebuild instead of a burst.
   *
   * @param cb - Called with the triggering file path and its change count.
   */
  watchFiles (cb: (path: string, count: number) => void | Promise<void>): void {
    const filesChangedCount: Record<string, number> = {}
    const ignored = this.context.blueprint.get(
      'stone.builder.watcher.ignored',
      ['node_modules/**', 'dist/**', '.stone/**', '.git/**']
    )
    const debounceMs = this.context.blueprint.get<number>('stone.builder.watcher.debounce', 120)

    const watcher = watch(this.resolveWatchPaths(), {
      ignored,
      cwd: basePath(),
      persistent: true,
      depth: undefined,
      ignoreInitial: true,
      followSymlinks: false
    })

    let timer: NodeJS.Timeout | undefined
    let pending: { path: string, count: number } | undefined

    const schedule = (path: string): void => {
      filesChangedCount[path] = (filesChangedCount[path] ?? 0) + 1
      pending = { path, count: filesChangedCount[path] }
      clearTimeout(timer)
      timer = setTimeout(() => {
        const change = pending
        pending = undefined
        /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
        if (change !== undefined) { void cb(change.path, change.count) }
      }, debounceMs)
    }

    watcher.on('change', schedule).on('add', schedule)

    process
      .on('SIGINT', () => { void watcher.close() })
      .on('SIGTERM', () => { void watcher.close() })
  }

  /**
   * Resolve the paths to watch: the source root plus the project config files.
   *
   * @returns The list of paths/globs for the watcher.
   */
  private resolveWatchPaths (): string[] {
    const inputAll = this.context.blueprint.get<string>('stone.builder.input.all', 'app/**/*.**')
    const sourceRoot = inputAll.split('/')[0].length > 0 ? inputAll.split('/')[0] : 'app'
    return [
      sourceRoot,
      'stone.config.mjs',
      'stone.config.js',
      'rollup.config.mjs',
      '.env',
      '.env.public'
    ]
  }

  /**
   * Exports the server entry point template.
   *
   * @returns The export status.
   */
  private async exportServerTemplate (): Promise<boolean> {
    if (await this.confirmCreation('server.mjs')) {
      writeFileSync(
        basePath('server.mjs'),
        serverIndexFile("'%printUrls%'"),
        'utf-8'
      )
      return true
    }
    return false
  }

  /**
   * Exports the console entry point template.
   *
   * @returns The export status.
   */
  private async exportConsoleTemplate (): Promise<boolean> {
    if (await this.confirmCreation('console.mjs')) {
      writeFileSync(
        basePath('console.mjs'),
        consoleIndexFile(),
        'utf-8'
      )
      return true
    }
    return false
  }

  /**
   * Exports the Rollup configuration file.
   *
   * @returns The export status.
   */
  private async exportRollupConfig (): Promise<boolean> {
    if (await this.confirmCreation('rollup.config.mjs')) {
      writeFileSync(
        basePath('rollup.config.mjs'),
        readFileSync(dirPath('../dist/rollup.config.js'), 'utf-8'),
        'utf-8'
      )
      return true
    }
    return false
  }

  /**
   * Confirm the creation of the file.
   *
   * @param path - The path of the file.
   * @returns The confirmation status.
  */
  private async confirmCreation (path: string): Promise<boolean> {
    if (existsSync(basePath(path))) {
      return await this.context.commandInput.confirm(`This file(${path}) already exists. Do you want to overwrite it?`)
    }

    return true
  }

  /**
   * Execute the pipeline.
   *
   * @param pipes - The pipeline to execute.
   */
  private async executeThroughPipeline (pipes: Array<MetaPipe<ConsoleContext, IBlueprint>>): Promise<void> {
    await Pipeline
      .create<ConsoleContext, IBlueprint>()
      .send(this.context)
      .through(...pipes)
      .then(context => context.blueprint)
  }
}
