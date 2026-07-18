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
        title: `Hello ${String(event.get<string>('name', 'World'))}!`,
        description: 'This is a simple example of a React application using Stone.js',
        metas: [
          { name: 'author', content: 'Stone.js' },
          { name: 'keywords', content: 'stonejs,js,react,example' }
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
        <section className='container'>
          <h1 className='h1 text-center mt-64'>{data?.message}</h1>
        </section>
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
