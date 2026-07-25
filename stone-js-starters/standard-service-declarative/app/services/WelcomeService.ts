import { ILogger, Service } from '@stone-js/core'

/**
 * Welcome Service Options
*/
export interface WelcomeServiceOptions {
  logger: ILogger
}

/**
 * Framework information carried by the welcome payload.
*/
export interface FrameworkInfo {
  name: string
  tagline: string
  docs: string
  github: string
}

/**
 * The branded welcome payload returned to the client.
*/
export interface WelcomeResponse {
  message: string
  framework: FrameworkInfo
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
  welcome (name: string): WelcomeResponse {
    this.logger.info(`Welcome ${name}`)
    return {
      message: `Hello ${name}! Welcome to Stone.js.`,
      framework: {
        name: 'Stone.js',
        tagline: 'The continuum framework',
        docs: 'https://stonejs.dev',
        github: 'https://github.com/stone-foundation/stone-js-framework'
      }
    }
  }
}
