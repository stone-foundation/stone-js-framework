import { JSX } from 'react'
import { Browser } from '@stone-js/browser-adapter'
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
      title: `${String(event.get<string>('name', 'World'))} · Welcome to Stone.js`,
      description: 'A universal Stone.js application. Write your domain once; Stone.js is the context that runs it anywhere.',
      metas: [
        { name: 'author', content: 'Stone.js' },
        { name: 'keywords', content: 'stonejs,continuum,react,universal,framework' }
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
      <main className='stone-welcome'>
        <div className='glow' aria-hidden='true' />
        <section className='hero'>
          <img className='mark' src='/logo.svg' alt='Stone.js' width={104} height={104} />
          <p className='eyebrow'>Welcome to</p>
          <h1 className='title'>Stone.js</h1>
          <p className='lead'>{data?.message}</p>
          <p className='tagline'>
            Your app is running. Write your domain once, Stone.js is the context that runs it
            anywhere: server, serverless, browser, CLI and the edge.
          </p>
          <nav className='links'>
            <a href='https://stonejs.dev/docs' target='_blank' rel='noreferrer noopener'>Documentation</a>
            <a href='https://github.com/stone-foundation/stone-js-framework' target='_blank' rel='noreferrer noopener'>GitHub</a>
            <span className='edit'>Edit <b>app/Application.tsx</b></span>
          </nav>
        </section>
        <footer className='brand'><span className='dot'>●</span> Stone.js — the continuum framework</footer>
      </main>
    )
  }
}

/**
 * Response data
 */
export interface ResponseData {
  message: string
}
