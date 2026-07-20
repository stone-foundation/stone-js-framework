import statuses from 'statuses'
import { NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { BinaryFileResponse } from '@stone-js/http-core'
import { detectEventVersion } from '../event-normalizer'
import { AwsLambdaHttpAdapterError } from '../errors/AwsLambdaHttpAdapterError'
import { AwsLambdaHttpAdapterContext, AwsLambdaHttpAdapterResponseBuilder } from '../declarations'

/**
 * Middleware for handling server responses and transforming them into the appropriate HTTP responses.
 *
 * This middleware processes outgoing responses and attaches the necessary headers, status codes,
 * and body content to the HTTP response.
 */
export class ServerResponseMiddleware {
  /**
   * Handles the outgoing response, processes it, and invokes the next middleware in the pipeline.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @param next - The next middleware to be invoked in the pipeline.
   * @returns A promise resolving to the rawResponseBuilder.
   * @throws {AwsLambdaHttpAdapterError} If required components are missing in the context.
   */
  async handle (context: AwsLambdaHttpAdapterContext, next: NextMiddleware<AwsLambdaHttpAdapterContext, AwsLambdaHttpAdapterResponseBuilder>): Promise<AwsLambdaHttpAdapterResponseBuilder> {
    const rawResponseBuilder = await next(context)

    if (context.rawEvent === undefined || context.incomingEvent === undefined || context.outgoingResponse === undefined || rawResponseBuilder?.add === undefined) {
      throw new AwsLambdaHttpAdapterError('The context is missing required components.')
    }

    rawResponseBuilder
      .add('headers', context.outgoingResponse.headers)
      .add('version', detectEventVersion(context.rawEvent))
      .add('statusCode', context.outgoingResponse.statusCode ?? 500)
      .add('statusMessage', context.outgoingResponse.statusMessage ?? statuses.message[context.outgoingResponse.statusCode ?? 500])

    if (!context.incomingEvent.isMethod('HEAD')) {
      if (context.outgoingResponse instanceof BinaryFileResponse) {
        rawResponseBuilder
          .add('isBase64Encoded', true)
          .add('body', context.outgoingResponse.file.getContent('base64'))
      } else {
        const isBuffer = Buffer.isBuffer(context.outgoingResponse.content)
        const content = isBuffer
          ? (context.outgoingResponse.content as Buffer).toString('base64')
          : context.outgoingResponse.content

        rawResponseBuilder
          .add('body', content)
          .add('isBase64Encoded', isBuffer)
      }
    }

    return rawResponseBuilder
  }
}

/**
 * Meta Middleware for processing server responses.
 */
export const MetaServerResponseMiddleware: MetaMiddleware<any, any> = { module: ServerResponseMiddleware, isClass: true }
