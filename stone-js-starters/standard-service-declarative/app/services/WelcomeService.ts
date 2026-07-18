import { ILogger, Service } from '@stone-js/core'

/**
 * Welcome Service Options
*/
export interface WelcomeServiceOptions {
  logger: ILogger
}

/**
 * Welcome Service
 *
 * @Service() decorator is used to define a new service
 * @Service() is an alias of @Stone() decorator.
 * The alias is required to get benefits of desctructuring Dependency Injection.
*/
@Service({ alias: 'welcomeService' })
export class WelcomeService {
  private readonly logger: ILogger

  /**
   * Create a new Welcome Service
  */
  constructor ({ logger }: WelcomeServiceOptions) {
    this.logger = logger
  }

  /**
   * Welcome
   *
   * @param name - The name
   * @returns A welcome message
   */
  welcome (name: string): { message: string } {
    this.logger.info(`Welcome ${name}`)
    return { message: `Hello ${name}!` }
  }
}
