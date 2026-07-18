import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'
import { ConsoleContext } from '../declarations'
import { AppBuilder } from '../create/AppBuilder'
import { CommandOptions } from '@stone-js/node-cli-adapter'

/**
 * The init command options.
 */
export const initCommandOptions: CommandOptions = {
  name: 'init',
  alias: 'i',
  args: ['[project-name]'],
  desc: 'Create a fresh Stone app from a starter template',
  options: (yargs: Argv) => {
    return yargs
      .positional('project-name', {
        type: 'string',
        desc: 'your project name'
      })
      .option('yes', {
        alias: 'y',
        default: false,
        type: 'boolean',
        desc: 'create with default values'
      })
      .option('force', {
        alias: 'f',
        type: 'boolean',
        desc: 'Force overriding'
      })
      .option('starters', {
        alias: 's',
        type: 'string',
        desc: 'Comma-separated starter links (git/npm/local), e.g. github:owner/repo,@acme/stone-starters. Overrides the built-in default.'
      })
  }
}

/**
 * The init command class.
 */
export class InitCommand {
  /**
   * Create a new instance of CoreServiceProvider.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {}

  /**
   * Handle the incoming event.
   */
  async handle (event: IncomingEvent): Promise<void> {
    try {
      await new AppBuilder(this.context).build(event)
    } catch (error: any) {
      this.context.commandOutput.error(error.message)
    }
  }
}
