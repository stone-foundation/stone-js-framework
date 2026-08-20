import { Argv } from 'yargs'
import fsExtra from 'fs-extra'
import spawn from 'cross-spawn'
import { parse } from 'node:path'
import { ConsoleContext } from '../declarations'
import { ChildProcess } from 'node:child_process'
import { IncomingEvent, isNotEmpty } from '@stone-js/core'
import { CommandOptions } from '@stone-js/node-cli-adapter'
import { basePath } from '@stone-js/filesystem'
import { CliError } from '../errors/CliError'
import { setupProcessSignalHandlers } from '../utils'
import { resolveBuilderDefinition, runBuilderStep } from '../builders/resolveBuilder'

const { pathExistsSync } = fsExtra

/**
 * The preview command options.
 */
export const previewCommandOptions: CommandOptions = {
  name: 'preview',
  alias: 'p',
  args: ['[filename]'],
  desc: 'Run project in preview mode',
  options: (yargs: Argv) => {
    return yargs
      .positional('filename', {
        type: 'string',
        desc: 'file path to preview'
      })
      .option('target', {
        alias: 't',
        type: 'string',
        desc: 'app target to preview',
        choices: ['server', 'react']
      })
  }
}

/**
 * The preview command class.
 */
export class PreviewCommand {
  private serverProcess?: ChildProcess

  /**
   * Create a new instance of PreviewCommand.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {
    setupProcessSignalHandlers(() => this.serverProcess)
  }

  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   */
  async handle (event: IncomingEvent): Promise<void> {
    const filename = event.get<string>('filename')

    if (isNotEmpty<string>(filename) && pathExistsSync(basePath(filename))) {
      const parsed = parse(basePath(filename))
      this.startProcess(parsed.base, parsed.dir)
    } else {
      const definition = resolveBuilderDefinition(this.context, event)

      await runBuilderStep(this.context, event, 'preview')

      const entry = definition.previewEntry?.(this.context.blueprint)

      if (entry === undefined) {
        throw new CliError(`The "${definition.target}" target cannot be previewed: it declares no preview entry.`)
      }

      this.startProcess(entry)
    }
  }

  /**
   * Start Process.
   */
  private startProcess (path: string, cwd?: string): void {
    this.serverProcess = spawn('node', [path], { stdio: 'inherit', cwd })
    this.serverProcess.on('exit', (code) => process.exit(code ?? 0))
  }
}
