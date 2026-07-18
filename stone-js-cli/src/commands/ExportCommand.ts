import { Argv } from 'yargs'
import { isReactApp } from '../utils'
import { IncomingEvent } from '@stone-js/core'
import { ConsoleContext } from '../declarations'
import { ReactBuilder } from '../react/ReactBuilder'
import { ServerBuilder } from '../server/ServerBuilder'
import { CommandOptions } from '@stone-js/node-cli-adapter'

/**
 * The export command options.
 */
export const exportCommandOptions: CommandOptions = {
  name: 'export',
  alias: 'e',
  args: ['[module]'],
  desc: 'Useful to export Stone.js or third party config/options',
  options: (yargs: Argv) => {
    return yargs
      .positional('module', {
        type: 'string',
        default: 'app',
        choices: ['app', 'console', 'rollup', 'vite'],
        desc: 'module or config name to export. e.g. app, console, rollup'
      })
  }
}

/**
 * The export command class.
 */
export class ExportCommand {
  /**
   * Create a new instance of ExportCommand.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {}

  /**
   * Handle the incoming event.
   */
  async handle (event: IncomingEvent): Promise<void> {
    if (isReactApp(this.context.blueprint, event)) {
      await new ReactBuilder(this.context).export(event)
    } else {
      await new ServerBuilder(this.context).export(event)
    }
  }
}
