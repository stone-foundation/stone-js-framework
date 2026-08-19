import { NodeHttp } from '@stone-js/node-http-adapter'
import { IncomingEvent, IEventHandler, ILogger, LogLevel, StoneApp } from '@stone-js/core'

/**
 * Application
 *
 * This is the main application entry point.
 *
 * @NodeHttp() is used to enable the Node HTTP adapter.
 * @StoneApp() is used to enable the Stone application, it is required.
 */
@NodeHttp({ default: true })
@StoneApp({ logger: { level: LogLevel.INFO } })
export class Application implements IEventHandler<IncomingEvent> {
  /**
   * Logger is a service for logging.
  */
  private readonly logger: ILogger

  /**
   * Create a new instance of Application
   * At this point, all the dependencies are resolved and injected.
   * You can access the container and all the services.
   *
   * @param logger - Logger service.
  */
  constructor ({ logger }: { logger: ILogger }) {
    this.logger = logger
  }

  /**
   * Handle incoming events
   *
   * @param event Incoming event
   * @returns response
  */
  handle (event: IncomingEvent): ResponseData {
    // Get the name from the event
    const name = String(event.get<string>('name', 'World'))
    const message = `Hello ${name}! Welcome to Stone.js.`

    // Log a message
    this.logger.info(message)

    // Return a branded JSON response
    return {
      message,
      framework: {
        name: 'Stone.js',
        tagline: 'The continuum framework',
        docs: 'https://stonejs.dev',
        github: 'https://github.com/stone-foundation/stone-js-framework'
      }
    }
  }
}

/**
 * Response data
 */
export interface ResponseData {
  message: string
  framework: {
    name: string
    tagline: string
    docs: string
    github: string
  }
}
