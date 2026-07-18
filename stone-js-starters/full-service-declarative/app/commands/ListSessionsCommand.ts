import { UserService } from '../services/UserService'
import { SessionService } from '../services/SessionService'
import { ILogger, IncomingEvent, isEmpty } from '@stone-js/core'
import { Command, CommandBuilder, ICommandHandler } from '@stone-js/node-cli-adapter'

/**
 * ListSessionsCommandOptions
*/
export interface ListSessionsCommandOptions {
  logger: ILogger
  userService: UserService
  sessionService: SessionService
}

/**
 * List sessions command
 */
@Command({
  alias: 'ls',
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
export class ListSessionsCommand implements ICommandHandler<IncomingEvent> {
  private readonly logger: ILogger
  private readonly userService: UserService
  private readonly sessionService: SessionService

  /**
   * Create a new instance of ListSessionsCommand
   *
   * @param logger
   * @param sessionService
   */
  constructor ({ logger, sessionService, userService }: ListSessionsCommandOptions) {
    this.logger = logger
    this.userService = userService
    this.sessionService = sessionService
  }

  /**
   * Handler for the ListSessionsCommand
   *
   * @param event - Incoming event
   */
  async handle (event: IncomingEvent): Promise<void> {
    const email = event.get<number>('email')
    const limit = event.get<number>('limit', 10)
    const user = isEmpty(email) ? undefined : await this.userService.findByEmail({ email })
    const sessions = isEmpty(user)
      ? await this.sessionService.list(limit)
      : await this.sessionService.getByUser(user, limit)
    this.logger.info('List sessions command')
    console.table(sessions)
  }
}
