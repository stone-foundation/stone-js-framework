import { NODE_HTTP_PLATFORM, nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'
import { defineStoneApp, ILogger, IncomingEvent, FunctionalEventHandler } from '@stone-js/core'

/**
 * Create an handler using the factory handler.
 */
export const FactoryHandler = ({ logger }: AppOptions): FunctionalEventHandler<IncomingEvent, ResponseData> => {
  return (event: IncomingEvent): ResponseData => {
    // Get the name from the event
    const name = String(event.get<string>('name', 'World'))
    const message = `Hello ${name}! Welcome to Stone.js.`

    // Log a message
    logger.info(message)

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
 * Application factory.
 *
 * @param options - The application options.
 * @returns A function that handles incoming events and returns a response.
 */
export const Application = defineStoneApp(
  FactoryHandler,
  {
    debug: true,
    isFactory: true,
    adapter: { platform: NODE_HTTP_PLATFORM }
  },
  [nodeHttpAdapterBlueprint]
)

/**
 * Application options.
 */
interface AppOptions {
  logger: ILogger
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
