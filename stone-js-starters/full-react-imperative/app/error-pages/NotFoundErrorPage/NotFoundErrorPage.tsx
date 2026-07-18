import './NotFoundErrorPage.css'
import { JSX } from 'react'
import { ILogger } from '@stone-js/core'
import { RouteNotFoundError } from '@stone-js/router'
import { IErrorPage, ReactIncomingEvent, ErrorPageRenderContext, defineErrorPage } from '@stone-js/use-react'

/**
 * NotFound Error Page.
 */
export const NotFoundErrorPage = ({ logger }: { logger: ILogger }): IErrorPage<ReactIncomingEvent> => ({
  /**
   * Handle the error.
   *
   * @param error - The error to handle.
   * @param event - The incoming event.
   * @returns The response.
   */
  handle (error: RouteNotFoundError, event: ReactIncomingEvent): { message: string } {
    logger.error(error.message, { error })
    return { message: `Page not found: ${event.pathname}` }
  },

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ data, statusCode }: ErrorPageRenderContext<RouteNotFoundError>): JSX.Element {
    return (
      <div className='text-center'>
        <h1 className='h1'>{statusCode}</h1>
        <h2 className='h4'>OOps! It seems you are lost?</h2>
        <p className='text-muted mt-24'>{data?.message}</p>
      </div>
    )
  }
})

/**
 * NotFound Error Page Blueprint.
 */
export const NotFoundErrorPageBlueprint = defineErrorPage(
  NotFoundErrorPage,
  {
    layout: 'error',
    error: ['RouteNotFoundError', 'PostNotFoundError', 'UserNotFoundError']
  }
)
