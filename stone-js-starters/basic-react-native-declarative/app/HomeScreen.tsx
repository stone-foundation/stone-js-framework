import { JSX } from 'react'
import { WelcomeView } from './WelcomeView'
import { ILogger, Promiseable } from '@stone-js/core'
import { HeadContext, IPage, Page, PageHeadContext, PageRenderContext, ReactIncomingEvent } from '@stone-js/use-react-native'

/**
 * The home screen.
 *
 * A page, exactly as on the web: `@Page` binds it to a route, `handle` answers, `head` names it and
 * `render` draws it. The only native thing here is what `render` returns, and it returns React
 * Native components instead of DOM ones.
 *
 * Adding a screen is adding a file like this one. Nothing lists it: `withStone` collects everything
 * under `app/` before Metro bundles.
 */
@Page('/')
export class HomeScreen implements IPage<ReactIncomingEvent> {
  /**
   * Logger is a service for logging.
   */
  private readonly logger: ILogger

  /**
   * Create a new instance of HomeScreen.
   * At this point, all the dependencies are resolved and injected.
   *
   * @param logger - Logger service.
   */
  constructor ({ logger }: { logger: ILogger }) {
    this.logger = logger
  }

  /**
   * Handle incoming events.
   *
   * A deep link carries its parameters here: `stone://app/?name=Ada` arrives as an event, and
   * `event.get` reads from it the same way an HTTP request would be read.
   *
   * @param event - Incoming event.
   * @returns The screen's data.
   */
  handle (event: ReactIncomingEvent): ResponseData {
    const message = `Hello ${String(event.get<string>('name', 'World'))}!`

    this.logger.info(message)

    return { message }
  }

  /**
   * Set the screen's head.
   *
   * A phone has no meta tags, so the title is what a navigator shows in its header. The same `head`
   * a web page declares, read by a different renderer.
   *
   * @returns The head context.
   */
  head ({ event }: PageHeadContext): Promiseable<HeadContext> {
    return {
      title: `${String(event.get<string>('name', 'World'))} · Welcome to Stone.js`,
      description: 'A universal Stone.js application. Write your domain once; Stone.js is the context that runs it anywhere.'
    }
  }

  /**
   * Render the screen.
   *
   * @returns The rendered screen.
   */
  render ({ data }: PageRenderContext<ResponseData>): JSX.Element {
    return <WelcomeView message={data?.message} />
  }
}

/**
 * Response data
 */
export interface ResponseData {
  message: string
}
