import { Argv } from 'yargs'
import { isReactApp } from '../utils'
import { IncomingEvent } from '@stone-js/core'
import { ConsoleContext } from '../declarations'
import { ReactBuilder } from '../react/ReactBuilder'
import { ServerBuilder } from '../server/ServerBuilder'
import { CommandOptions } from '@stone-js/node-cli-adapter'

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
        desc: 'app target to build',
        choices: ['server', 'react']
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
    if (isReactApp(this.context.blueprint, event)) {
      await new ReactBuilder(this.context).build(event)
    } else {
      await new ServerBuilder(this.context).build(event)
    }
  }
}
