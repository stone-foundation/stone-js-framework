import { JSX } from 'react'
import { WelcomeView } from './WelcomeView'
import { ILogger, Promiseable } from '@stone-js/core'
import { definePage, HeadContext, IPage, PageHeadContext, PageRenderContext, ReactIncomingEvent } from '@stone-js/use-react-native'

/**
 * The home screen, as a factory.
 *
 * A page, exactly as on the web: it answers with `handle`, names itself with `head` and draws itself
 * with `render`. The only native thing here is what `render` returns, and it returns React Native
 * components instead of DOM ones.
 *
 * The factory receives the container's services as its argument, which is how this paradigm gets
 * dependency injection without a constructor.
 *
 * @param options - The injected services.
 * @returns The page.
 */
export const HomeScreen = ({ logger }: AppOptions): IPage<ReactIncomingEvent> => {
  return {
    /**
     * Handle incoming events.
     *
     * A deep link carries its parameters here: `stone://?name=Ada` arrives as an event, and
     * `event.get` reads from it the same way an HTTP request would be read.
     *
     * @param event - Incoming event.
     * @returns The screen's data.
     */
    handle (event: ReactIncomingEvent): ResponseData {
      const message = `Hello ${String(event.get<string>('name', 'World'))}!`

      logger.info(message)

      return { message }
    },

    /**
     * Set the screen's head.
     *
     * A phone has no meta tags, so the title is what a navigator shows in its header. The same
     * `head` a web page declares, read by a different renderer.
     *
     * @returns The head context.
     */
    head ({ event }: PageHeadContext): Promiseable<HeadContext> {
      return {
        title: `${String(event.get<string>('name', 'World'))} · Welcome to Stone.js`,
        description: 'A universal Stone.js application. Write your domain once; Stone.js is the context that runs it anywhere.'
      }
    },

    /**
     * Render the screen.
     *
     * @returns The rendered screen.
     */
    render ({ data }: PageRenderContext<ResponseData>): JSX.Element {
      return <WelcomeView message={data?.message} />
    }
  }
}

/**
 * HomeScreen Blueprint
 *
 * Binds the page to its route. Adding a screen is adding a file like this one: nothing lists it,
 * because `withStone` collects everything under `app/` before Metro bundles.
 */
export const HomeScreenBlueprint = definePage(HomeScreen, { path: '/' })

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
}
