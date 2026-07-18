import './DefaultErrorPage.css'
import { JSX } from 'react'
import { ILogger } from '@stone-js/core'
import { ErrorPage, IErrorPage, PageStatus, ReactIncomingEvent, ErrorPageRenderContext } from '@stone-js/use-react'

/**
 * Forbidden Error Handler component.
 */
@ErrorPage({
  layout: 'error',
  error: 'default'
})
export class DefaultErrorPage implements IErrorPage<ReactIncomingEvent> {
  private readonly logger: ILogger

  /**
   * Create an DefaultErrorPage.
   *
   * @param logger - The logger.
   */
  constructor ({ logger }: { logger: ILogger }) {
    this.logger = logger
  }

  /**
   * Handle the error.
   *
   * @param error - The error to handle.
   * @returns The response.
   */
  @PageStatus(500)
  handle (error: any): { message: string } {
    this.logger.error(error.message, { error })
    return { message: 'Oops! Something went wrong!' }
  }

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ data, statusCode }: ErrorPageRenderContext<Error>): JSX.Element {
    return (
      <div className='text-center'>
        <h1 className='h1'>{statusCode}</h1>
        <h2 className='h4'>An Error occured!</h2>
        <p className='text-muted mt-24'>{data?.message}</p>
      </div>
    )
  }
}
