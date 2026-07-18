import { Router } from '../Router'
import { RouterError } from '../errors/RouterError'
import { IncomingEvent, IBlueprint, IContainer } from '@stone-js/core'
import { CommandOptions, IArgv, RouterOptions } from '../declarations'

/**
 * Configuration for the `router` command.
 * Defines command name, alias, arguments, description, and options.
 */
export const routerCommandOptions: CommandOptions = {
  name: 'router',
  alias: 'r',
  args: ['<action>'],
  desc: 'Router utility commands',
  options: (yargs: IArgv) => {
    return yargs
      .positional('action', {
        type: 'string',
        choices: ['list'],
        desc: 'Display route definitions'
      })
  }
}

/**
 * Handles router-related commands by interacting with the Router instance.
 */
export class RouterCommand {
  /**
   * Initializes a new instance of `RouterCommand`.
   *
   * @param container - The dependency injection container for resolving the Router instance.
   * @throws {RouterError} If the container is not provided.
   */
  constructor (private readonly container: IContainer) {
    if (container === undefined) {
      throw new RouterError('Container is required to create a RouterCommand instance.')
    }
  }

  /**
   * Processes an incoming event and executes the specified router action.
   *
   * @param event - The event containing metadata for router actions.
   * @returns A promise resolving to an `OutgoingResponse`.
   */
  async handle (event: IncomingEvent): Promise<void> {
    const action = event.getMetadataValue<string>('action')

    if (action === 'list') {
      console.table(await Router.create(this.getRouterOptions()).dumpRoutes())
    }
  }

  private getRouterOptions (): RouterOptions {
    const routerOptions = this.container.make<IBlueprint>('blueprint').get<RouterOptions>('stone.router', {} as any)
    return { ...routerOptions, dependencyResolver: this.container }
  }
}
