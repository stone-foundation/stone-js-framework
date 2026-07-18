import { Argv } from 'yargs'
import spawn from 'cross-spawn'
import process from 'node:process'
import { IncomingEvent } from '@stone-js/core'
import { ConsoleContext } from '../declarations'
import { ChildProcess } from 'node:child_process'
import { nodeModulesPath } from '@stone-js/filesystem'
import { CommandOptions } from '@stone-js/node-cli-adapter'
import { isTypescriptApp, setupProcessSignalHandlers } from '../utils'

/**
 * The typings command options.
 */
export const typingsCommandOptions: CommandOptions = {
  name: 'typings',
  alias: 't',
  desc: 'Check code typings for typescript',
  options: (yargs: Argv) => {
    return yargs
      .option('watch', {
        alias: 'w',
        type: 'boolean',
        default: false,
        desc: 'Launch checker in watch mode for Typescript'
      })
  }
}

/**
 * The typings command class.
 */
export class TypingsCommand {
  private serverProcess?: ChildProcess

  /**
   * Create a new instance of TypingsCommand.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {
    setupProcessSignalHandlers(() => this.serverProcess)
  }

  /**
   * Handle the incoming event.
   */
  async handle (event: IncomingEvent): Promise<void> {
    if (isTypescriptApp(this.context.blueprint, event)) {
      this.startProcess(event.get<boolean>('watch', false) ? ['--watch'] : [])
    }
  }

  /**
   * Start Process.
   */
  private startProcess (args: string[] = []): void {
    this.serverProcess = spawn('node', [nodeModulesPath('.bin/tsc'), '--noEmit'].concat(args), { stdio: 'inherit' })
    this.serverProcess.on('exit', (code) => process.exit(code ?? 0))
  }
}
