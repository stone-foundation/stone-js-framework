import { Argv } from 'yargs'
import fsExtra from 'fs-extra'
import spawn from 'cross-spawn'
import { parse } from 'node:path'
import { ConsoleContext } from '../declarations'
import { ChildProcess } from 'node:child_process'
import { ReactBuilder } from '../react/ReactBuilder'
import { ServerBuilder } from '../server/ServerBuilder'
import { IncomingEvent, isNotEmpty } from '@stone-js/core'
import { CommandOptions } from '@stone-js/node-cli-adapter'
import { isReactApp, setupProcessSignalHandlers } from '../utils'
import { basePath, buildPath, distPath } from '@stone-js/filesystem'

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
    } else if (isReactApp(this.context.blueprint, event)) {
      await new ReactBuilder(this.context).preview(event)
      this.startProcess(buildPath('preview.mjs'))
    } else {
      await new ServerBuilder(this.context).preview(event)
      const output = this.context.blueprint.get<string>('stone.builder.output', 'server.mjs')
      this.startProcess(distPath(output))
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
