import { IErrorHandler, IBlueprint } from '@stone-js/core'
import { MetaErrorPage, ReactIncomingEvent } from './declarations'

/**
 * UseReactError response type.
 */
export type UseReactErrorResponseType = Record<
'content' | 'statusCode',
Partial<MetaErrorPage<ReactIncomingEvent>> | number
>

/**
 * Class representing an UseReactUseReactKernelErrorHandler.
 *
 * Kernel level error handler for React applications.
 */
export class UseReactKernelErrorHandler implements IErrorHandler<
ReactIncomingEvent,
UseReactErrorResponseType
> {
  private readonly blueprint: IBlueprint

  /**
   * Create an UseReactUseReactKernelErrorHandler.
   *
   * @param options - UseReactUseReactKernelErrorHandler options.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Handle an error.
   *
   * @param error - The error to handle.
   * @returns The outgoing http response.
   */
  public handle (error: any): UseReactErrorResponseType {
    const metavalue = this.blueprint.get<MetaErrorPage<ReactIncomingEvent>>(`stone.useReact.errorPages.${String(error?.name)}`) ??
      this.blueprint.get<MetaErrorPage<ReactIncomingEvent>>('stone.useReact.errorPages.default', {} as any)

    return { content: { ...metavalue, error }, statusCode: error?.statusCode ?? 500 }
  }
}
