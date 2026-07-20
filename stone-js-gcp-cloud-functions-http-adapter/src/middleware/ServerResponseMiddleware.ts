import statuses from 'statuses'
import { IBlueprint, NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { GcpCloudFunctionsHttpAdapterError } from '../errors/GcpCloudFunctionsHttpAdapterError'
import { BinaryFileResponse, streamFile, StreamFileOptions } from '@stone-js/http-core'
import { GcpCloudFunctionsHttpAdapterContext, GcpCloudFunctionsHttpAdapterResponseBuilder } from '../declarations'

/**
 * Middleware for handling server responses and transforming them into the appropriate HTTP responses.
 *
 * This middleware processes outgoing responses and attaches the necessary headers, status codes,
 * and body content to the HTTP response.
 */
export class ServerResponseMiddleware {
  /**
   * The blueprint for resolving configuration and dependencies.
   */
  private readonly blueprint: IBlueprint

  /**
   * Create a ServerResponseMiddleware.
   *
   * @param {blueprint} options - Options for creating the ServerResponseMiddleware.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Handles the outgoing response, processes it, and invokes the next middleware in the pipeline.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @param next - The next middleware to be invoked in the pipeline.
   * @returns A promise resolving to the processed context.
   * @throws {GcpCloudFunctionsHttpAdapterError} If required components are missing in the context.
   */
  async handle (context: GcpCloudFunctionsHttpAdapterContext, next: NextMiddleware<GcpCloudFunctionsHttpAdapterContext, GcpCloudFunctionsHttpAdapterResponseBuilder>): Promise<GcpCloudFunctionsHttpAdapterResponseBuilder> {
    const rawResponseBuilder = await next(context)

    if (context.rawEvent === undefined || context.incomingEvent === undefined || context.outgoingResponse === undefined || rawResponseBuilder?.add === undefined) {
      throw new GcpCloudFunctionsHttpAdapterError('The context is missing required components.')
    }

    rawResponseBuilder
      .add('headers', context.outgoingResponse.headers)
      .add('statusCode', context.outgoingResponse.statusCode ?? 500)
      .add('statusMessage', context.outgoingResponse.statusMessage ?? statuses.message[context.outgoingResponse.statusCode ?? 500])

    if (!context.incomingEvent.isMethod('HEAD')) {
      if (context.outgoingResponse instanceof BinaryFileResponse) {
        const file = context.outgoingResponse.file
        const options = this.blueprint.get<StreamFileOptions>('stone.http.files.download', {} as any)
        rawResponseBuilder
          .add('streamFile', async () => await streamFile(context.rawEvent, context.rawResponse, file, options))
      } else {
        rawResponseBuilder
          .add('body', context.outgoingResponse.content)
          .add('charset', context.outgoingResponse.charset)
      }
    }

    return rawResponseBuilder
  }
}

/**
 * Meta Middleware for processing server responses.
 */
export const MetaServerResponseMiddleware: MetaMiddleware<any, any> = { module: ServerResponseMiddleware, isClass: true }
