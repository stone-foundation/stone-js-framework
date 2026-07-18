import './ForbiddenErrorPage.css'
import { JSX } from 'react'
import { ILogger } from '@stone-js/core'
import { ForbiddenError } from '../../errors/ForbiddenError'
import { IErrorPage, ReactIncomingEvent, ErrorPageRenderContext, defineErrorPage } from '@stone-js/use-react'

/**
 * Forbidden Error Page.
 */
export const ForbiddenErrorPage = ({ logger }: { logger: ILogger }): IErrorPage<ReactIncomingEvent> => ({
  /**
   * Handle the error.
   *
   * @param error - The error to handle.
   * @returns The response.
   */
  handle (error: ForbiddenError): { message: string } {
    logger.error(error.message, { error })
    return { message: "I think you're not supposed to be here! Eh ?" }
  },

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ data, statusCode }: ErrorPageRenderContext<ForbiddenError>): JSX.Element {
    return (
      <div className='text-center'>
        <h1 className='h1'>{statusCode}</h1>
        <h2 className='h4'>Are you in the right place?</h2>
        <p className='text-muted mt-24'>{data?.message}</p>
      </div>
    )
  }
})

/**
 * Forbidden Error Page Blueprint.
 */
export const ForbiddenErrorPageBlueprint = defineErrorPage(ForbiddenErrorPage, { layout: 'error', error: 'ForbiddenError' })
