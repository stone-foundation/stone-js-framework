import { defineService, ILogger } from '@stone-js/core'

/**
 * Welcome Service Options
*/
export interface WelcomeServiceOptions {
  logger: ILogger
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
  welcome (name: string): { message: string } {
    logger.info(`Welcome ${name}`)
    return { message: `Hello ${name}!` }
  }
})

/**
 * Welcome Service Blueprint
 */
export const WelcomeServiceBlueprint = defineService(
  WelcomeService,
  { alias: 'welcomeService', isFactory: true }
)
