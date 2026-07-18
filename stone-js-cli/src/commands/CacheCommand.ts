import fsExtra from 'fs-extra'
import { buildPath } from '@stone-js/filesystem'
import { ConsoleContext } from '../declarations'
import { CommandOptions } from '@stone-js/node-cli-adapter'

const { emptyDirSync } = fsExtra

/**
 * The cache command options.
 */
export const cacheCommandOptions: CommandOptions = {
  name: 'cache-clear',
  alias: 'cc',
  desc: 'Clear app cache'
}

/**
 * The cache command class.
 */
export class CacheCommand {
  /**
   * Create a new instance of CacheCommand.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {}

  /**
   * Handle the incoming event.
   */
  handle (): void {
    emptyDirSync(buildPath())
    this.context.commandOutput.info('Cache cleared!')
  }
}
