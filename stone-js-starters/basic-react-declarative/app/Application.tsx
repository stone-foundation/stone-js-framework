import { JSX } from 'react'
import { Browser } from '@stone-js/browser-adapter'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { ILogger, LogLevel, Promiseable, StoneApp } from '@stone-js/core'
import { ReactIncomingEvent, UseReact, HeadContext, IPage, PageHeadContext, PageRenderContext } from '@stone-js/use-react'

/**
 * Application
 *
 * This is the main application entry point.
 *
 * @UseReact() is used to enable React.
 * @Browser() is used to enable the Browser adapter.
 * @StoneApp() is used to enable the Stone application, it is required.
 */
@Browser()
@UseReact()
@NodeConsole()
@StoneApp({ logger: { level: LogLevel.INFO } })
export class Application implements IPage<ReactIncomingEvent> {
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
  handle (event: ReactIncomingEvent): ResponseData {
    // Get the name from the event
    const message = `Hello ${String(event.get<string>('name', 'World'))}!`

    // Log a message
    this.logger.info(message)

    // Return a JSON response
    return { message }
  }

  /**
   * Set the page head tags, like title, meta, link, script, style.
   *
   * @returns The head context.
   */
  head ({ event }: PageHeadContext): Promiseable<HeadContext> {
    return {
      title: `Hello ${String(event.get<string>('name', 'World'))}!`,
      description: 'This is a simple example of a React application using Stone.js',
      metas: [
        { name: 'author', content: 'Stone.js' },
        { name: 'keywords', content: 'stonejs,js,react,example' }
      ]
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ data }: PageRenderContext<ResponseData>): JSX.Element {
    return (
      <section className='container'>
        <h1 className='h1 text-center mt-64'>{data?.message}</h1>
      </section>
    )
  }
}

/**
 * Response data
 */
export interface ResponseData {
  message: string
}
