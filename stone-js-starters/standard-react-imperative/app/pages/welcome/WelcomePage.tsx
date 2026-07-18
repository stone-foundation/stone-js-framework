import { JSX } from 'react'
import { WelcomeService } from '../../services/WelcomeService'
import { definePage, IPage, PageRenderContext, ReactIncomingEvent } from '@stone-js/use-react'

/**
 * WelcomePage Options
*/
export interface WelcomePageOptions {
  welcomeService: WelcomeService
}

/**
 * Response data
 */
export interface ResponseData {
  message: string
}

/**
 * WelcomePage
 */
export const WelcomePage = ({ welcomeService }: WelcomePageOptions): IPage<ReactIncomingEvent> => ({
  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   * @returns A welcome message
  */
  handle (event: ReactIncomingEvent): ResponseData {
    return welcomeService.welcome(event.get<string>('name', 'World'))
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
})

/**
 * WelcomePage Blueprint
 */
export const WelcomePageBlueprint = definePage(WelcomePage, { path: '/:name?' })
