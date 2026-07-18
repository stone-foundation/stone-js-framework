import { ILogger, IncomingEvent } from '@stone-js/core'
import { IUserService } from '../services/contracts/IUserService'
import { CommandBuilder, defineCommand, FunctionalCommandHandler } from '@stone-js/node-cli-adapter'

/**
 * ListUsersCommandOptions
*/
export interface ListUsersCommandOptions {
  logger: ILogger
  userService: IUserService
}

/**
 * Factory List users command
 */
export function factoryListUsersCommand ({ logger, userService }: ListUsersCommandOptions): FunctionalCommandHandler<IncomingEvent> {
  return async function (event: IncomingEvent): Promise<void> {
    const limit = event.get<number>('limit', 10)
    const users = await userService.list(limit)
    logger.info('List users command')
    console.table(users)
  }
}

/**
 * List users command
 */
export const ListUsersCommand = defineCommand(factoryListUsersCommand, {
  alias: 'lu',
  isFactory: true,
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
