import { Argv } from 'yargs'
import { IncomingEvent } from '@stone-js/core'
import { ConsoleContext } from '../declarations'
import { CommandOptions } from '@stone-js/node-cli-adapter'
import { runBuilderStep } from '../builders/resolveBuilder'

/**
 * The build command options.
 */
export const buildCommandOptions: CommandOptions = {
  name: 'build',
  alias: 'prod',
  args: ['[target]'],
  desc: 'Build project for production',
  options: (yargs: Argv) => {
    return yargs
      .positional('target', {
        type: 'string',
        desc: 'app target to build (any registered target; run without it to let the project decide)'
      })
      .option('language', {
        alias: 'lang',
        type: 'string',
        desc: 'language to use',
        choices: ['javascript', 'typescript']
      })
      .option('rendering', {
        alias: 'r',
        type: 'string',
        desc: 'web rendering type',
        choices: ['csr', 'ssr', 'ssg']
      })
      .option('ssg', {
        type: 'boolean',
        desc: 'static site generation (pre-render routes to HTML)'
      })
      .option('lazy', {
        alias: 'l',
        type: 'boolean',
        desc: 'lazy loading for pages, error pages and layouts'
      })
      .option('imperative', {
        alias: 'i',
        type: 'boolean',
        desc: 'imperative api'
      })
  }
}

/**
 * The build command class.
 */
export class BuildCommand {
  /**
   * Create a new instance of BuildCommand.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {}

  /**
   * Handle the incoming event.
   *
   * @returns The blueprint.
   */
  async handle (event: IncomingEvent): Promise<void> {
    await runBuilderStep(this.context, event, 'build')
  }
}
