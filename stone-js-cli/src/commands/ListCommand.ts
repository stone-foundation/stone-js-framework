import spawn from 'cross-spawn'
import process from 'node:process'
import { IncomingEvent } from '@stone-js/core'
import { buildPath } from '@stone-js/filesystem'
import { ConsoleContext } from '../declarations'
import { ChildProcess } from 'node:child_process'
import { ReactBuilder } from '../react/ReactBuilder'
import { ServerBuilder } from '../server/ServerBuilder'
import { CommandOptions } from '@stone-js/node-cli-adapter'
import { shouldBuild, setupProcessSignalHandlers, isReactApp } from '../utils'

/**
 * The list command options.
 */
export const listCommandOptions: CommandOptions = {
  name: 'list',
  alias: 'ls',
  desc: 'List all user-defined commands'
}

/**
 * The list command class.
 */
export class ListCommand {
  private serverProcess?: ChildProcess

  /**
   * Create a new instance of ListCommand.
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
   * @returns The blueprint.
   */
  async handle (event: IncomingEvent): Promise<void> {
    const pattern = this.context.blueprint.get(
      'stone.builder.input.all',
      'app/**/*.**'
    )

    if (shouldBuild(pattern)) {
      if (isReactApp(this.context.blueprint, event)) {
        await new ReactBuilder(this.context).console(event)
      } else {
        await new ServerBuilder(this.context).console(event)
      }
    }

    this.startProcess()
  }

  /**
   * Start Process.
   */
  private startProcess (): void {
    this.serverProcess = spawn('node', [buildPath('console.mjs'), '--help'], { stdio: 'inherit' })
    this.serverProcess.on('exit', (code) => process.exit(code ?? 0))
  }
}
