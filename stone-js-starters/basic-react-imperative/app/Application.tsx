import { JSX } from 'react'
import { browserAdapterBlueprint } from '@stone-js/browser-adapter'
import { defineConfig, IBlueprint, ILogger, isNotEmpty, Promiseable } from '@stone-js/core'
import { defineCommand, FactoryCommandHandler, NODE_CONSOLE_PLATFORM, nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'
import { defineStoneReactApp, HeadContext, IPage, PageHeadContext, PageRenderContext, ReactIncomingEvent } from '@stone-js/use-react'

/**
 * Create an handler using the factory handler.
 */
export const FactoryHandler = ({ logger }: AppOptions): IPage<ReactIncomingEvent> => {
  return {
    handle (event: ReactIncomingEvent): ResponseData {
      // Get the name from the event
      const message = `Hello ${String(event.get<string>('name', 'World'))}!`

      // Log a message
      logger.info(message)

      // Return a JSON response
      return { message }
    },

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
    },

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
}

/**
 * Stone-React application.
 */
export const Application = defineStoneReactApp(
  FactoryHandler,
  { debug: true, isFactory: true },
  [browserAdapterBlueprint, nodeConsoleAdapterBlueprint]
)

/**
 * Application configuration.
 */
export const AppConfig = defineConfig({
  afterConfigure (blueprint: IBlueprint) {
    if (
      isNotEmpty<FactoryCommandHandler>(FactoryHandler) &&
      blueprint.is('stone.adapter.platform', NODE_CONSOLE_PLATFORM)
    ) {
      blueprint.set(defineCommand(FactoryHandler, { name: '*', isFactory: true }))
    }
  }
})

/**
 * Application options.
 */
interface AppOptions {
  logger: ILogger
}

/**
 * Response data
 */
interface ResponseData {
  message: string
}
