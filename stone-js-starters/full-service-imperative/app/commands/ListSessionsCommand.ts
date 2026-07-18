import { ILogger, IncomingEvent, isEmpty } from '@stone-js/core'
import { IUserService } from '../services/contracts/IUserService'
import { ISessionService } from '../services/contracts/ISessionService'
import { CommandBuilder, defineCommand, FunctionalCommandHandler } from '@stone-js/node-cli-adapter'

/**
 * ListSessionsCommandOptions
*/
export interface ListSessionsCommandOptions {
  logger: ILogger
  userService: IUserService
  sessionService: ISessionService
}

/**
 * Factory List sessions command
 */
export function factoryListSessionsCommand ({ logger, sessionService, userService }: ListSessionsCommandOptions): FunctionalCommandHandler<IncomingEvent> {
  return async function (event: IncomingEvent): Promise<void> {
    const email = event.get<number>('email')
    const limit = event.get<number>('limit', 10)
    const user = isEmpty(email) ? undefined : await userService.findByEmail({ email })
    const sessions = isEmpty(user)
      ? await sessionService.list(limit)
      : await sessionService.getByUser(user, limit)
    logger.info('List sessions command')
    console.table(sessions)
  }
}

/**
 * List sessions command
 */
export const ListSessionsCommand = defineCommand(factoryListSessionsCommand, {
  alias: 'ls',
  isFactory: true,
  name: 'list-sessions',
  desc: 'List sessions',
  options: (yargs: CommandBuilder) => {
    return yargs
      .option('email', {
        alias: 'e',
        type: 'string',
        default: undefined,
        desc: 'Filter sessions by email'
      })
      .option('limit', {
        alias: 'l',
        type: 'number',
        default: false,
        desc: 'Number of sessions to list'
      })
  }
})
