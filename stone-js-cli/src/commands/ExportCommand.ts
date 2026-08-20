import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'
import { ConsoleContext } from '../declarations'
import { CommandOptions } from '@stone-js/node-cli-adapter'
import { runBuilderStep } from '../builders/resolveBuilder'

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
    await runBuilderStep(this.context, event, 'export')
  }
}
