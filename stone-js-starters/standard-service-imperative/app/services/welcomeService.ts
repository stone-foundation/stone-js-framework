import { defineService, ILogger } from '@stone-js/core'

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
 * Welcome Service Type
 */
export type WelcomeService = ReturnType<typeof WelcomeService>

/**
 * Welcome Service
 */
/* eslint-disable-next-line @typescript-eslint/no-redeclare */
export const WelcomeService = ({ logger }: WelcomeServiceOptions): Record<PropertyKey, any> => ({
  /**
   * Welcome
   *
   * @param name - The name
   * @returns A welcome message
   */
  welcome (name: string): WelcomeResponse {
    logger.info(`Welcome ${name}`)
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
})

/**
 * Welcome Service Blueprint
 */
export const WelcomeServiceBlueprint = defineService(
  WelcomeService,
  { alias: 'welcomeService', isFactory: true }
)
