import { NodeHttp } from '@stone-js/node-http-adapter'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { IncomingEvent, IEventHandler, ILogger, LogLevel, StoneApp } from '@stone-js/core'

/**
 * Application
 *
 * This is the main application entry point.
 *
 * @NodeHttp() is used to enable the Node HTTP adapter.
 * @StoneApp() is used to enable the Stone application, it is required.
 */
@NodeConsole()
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
    const message = `Hello ${String(event.get<string>('name', 'World'))}!`

    // Log a message
    this.logger.info(message)

    // Return a JSON response
    return { message }
  }
}

/**
 * Response data
 */
export interface ResponseData {
  message: string
}
