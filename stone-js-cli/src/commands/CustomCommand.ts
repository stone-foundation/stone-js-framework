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
 * The custom command options.
 */
export const customCommandOptions: CommandOptions = {
  name: '*',
  desc: 'Redirect to user-defined commands'
}

/**
 * The custom command class.
 */
export class CustomCommand {
  private serverProcess?: ChildProcess

  /**
   * Create a new instance of CustomCommand.
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
      this.context.commandOutput.show(
        this.context.commandOutput.format.yellow('⚡ Building application...')
      )
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
    this.serverProcess = spawn('node', [buildPath('console.mjs'), ...process.argv.slice(2)], { stdio: 'inherit' })
    this.serverProcess.on('exit', (code) => process.exit(code ?? 0))
  }
}
