import { ILogger } from '@stone-js/core'

/**
 * WelcomeService — the shared domain service, identical to the declarative frontend variant.
 *
 * Here it carries NO decorator: the imperative API registers it explicitly with
 * `defineService(WelcomeService, { alias: 'welcomeService', isClass: true })` in Application.ts.
 */
export class WelcomeService {
  private readonly logger: ILogger

  constructor ({ logger }: { logger: ILogger }) {
    this.logger = logger
  }

  /**
   * @param name - The visitor's name.
   * @returns A greeting message.
   */
  greet (name: string): string {
    this.logger.info(`Greeting ${name}`)
    return `Hello ${name}!`
  }
}
