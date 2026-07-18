import { ILogger, Service } from '@stone-js/core'

/**
 * WelcomeService — the shared domain service for the frontend lab apps.
 *
 * `@Service({ alias: 'welcomeService' })` registers it in the container so pages can
 * destructure it (`constructor ({ welcomeService })`). Same service, same pages across the
 * SPA (CSR), SSR and SSG variants — only the rendering strategy differs.
 */
@Service({ alias: 'welcomeService' })
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
