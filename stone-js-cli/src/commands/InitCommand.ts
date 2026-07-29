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
      // Deliberately no short alias: `-s` belongs to `--starters`, and two one-letter flags for
      // two flags that already differ by a single character would be a trap.
      .option('starter', {
        type: 'string',
        desc: 'Starter id to scaffold, e.g. basic-react-declarative. Skips the starter question. Ids come from each linked package\'s stone.starters manifest.'
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
   *
   * Errors are NOT caught here on purpose: `ConsoleErrorHandler` prints the very same message and
   * returns a failing status, which the adapter turns into a non-zero exit code. Swallowing them
   * printed the error but exited 0, so a broken scaffold looked like a success to any script or CI
   * job calling `npm create @stone-js`.
   */
  async handle (event: IncomingEvent): Promise<void> {
    await new AppBuilder(this.context).build(event)
  }
}
