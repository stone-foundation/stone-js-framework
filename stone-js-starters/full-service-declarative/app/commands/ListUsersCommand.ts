import { UserService } from '../services/UserService'
import { ILogger, IncomingEvent } from '@stone-js/core'
import { Command, CommandBuilder, ICommandHandler } from '@stone-js/node-cli-adapter'

/**
 * ListUsersCommandOptions
*/
export interface ListUsersCommandOptions {
  logger: ILogger
  userService: UserService
}

/**
 * List users command
 */
@Command({
  alias: 'lu',
  name: 'list-users',
  desc: 'List users',
  options: (yargs: CommandBuilder) => {
    return yargs
      .option('limit', {
        alias: 'l',
        type: 'number',
        default: false,
        desc: 'Number of users to list'
      })
  }
})
export class ListUsersCommand implements ICommandHandler<IncomingEvent> {
  private readonly logger: ILogger
  private readonly userService: UserService

  /**
   * Create a new instance of ListUsersCommand
   *
   * @param logger
   * @param userService
   */
  constructor ({ logger, userService }: ListUsersCommandOptions) {
    this.logger = logger
    this.userService = userService
  }

  /**
   * Handler for the ListUsersCommand
   *
   * @param event - Incoming event
   */
  async handle (event: IncomingEvent): Promise<void> {
    const limit = event.get<number>('limit', 10)
    const users = await this.userService.list(limit)
    this.logger.info('List users command')
    console.table(users)
  }
}
