import { IncomingHttpHeaders, IncomingMessage } from 'node:http'
import { isMultipart, getFilesUploads } from '@stone-js/http-core'
import { getRawBody, normalizeHeaders } from '../event-normalizer'
import { IBlueprint, isNotEmpty, NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { TencentScfHttpAdapterError } from '../errors/TencentScfHttpAdapterError'
import { TencentScfHttpAdapterContext, TencentScfHttpAdapterResponseBuilder, TencentScfHttpEvent } from '../declarations'

/**
 * Class representing a FilesEventMiddleware.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class FilesEventMiddleware {
  /**
   * The blueprint for resolving configuration and dependencies.
   */
  private readonly blueprint: IBlueprint

  /**
   * Create a FilesEventMiddleware.
   *
   * @param {blueprint} options - Options for creating the FilesEventMiddleware.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Handles the incoming event, processes it, and invokes the next middleware in the pipeline.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @param next - The next middleware to be invoked in the pipeline.
   * @returns A promise that resolves to the destination type after processing.
   *
   * @throws {TencentScfHttpAdapterError} If required components such as the rawEvent or IncomingEventBuilder are not provided.
   */
  async handle (context: TencentScfHttpAdapterContext, next: NextMiddleware<TencentScfHttpAdapterContext, TencentScfHttpAdapterResponseBuilder>): Promise<TencentScfHttpAdapterResponseBuilder> {
    if (context.rawEvent === undefined || context.incomingEventBuilder?.add === undefined) {
      throw new TencentScfHttpAdapterError('The context is missing required components.')
    }

    if (isMultipart(this.normalizeEvent(context.rawEvent) as unknown as IncomingMessage)) {
      const options = this.blueprint.get<Record<string, any>>('stone.http.files.upload', {})
      const response = await getFilesUploads(this.normalizeEvent(context.rawEvent), options)
      const method = response.fields.$method$

      context
        .incomingEventBuilder
        .add('files', response.files)
        .add('body', response.fields)
        // Keep the untouched multipart payload available (webhook signatures, re-streaming, etc.).
        .add('metadata', { rawBody: getRawBody(context.rawEvent) })
        // In fullstack forms, the method is spoofed and sent as a hidden field.
      isNotEmpty(method) && context.incomingEventBuilder.add('method', method)
    }

    return await next(context)
  }

  /**
   * Normalize the incoming event to an IncomingMessage.
   *
   * @param rawEvent - The raw event to be normalized.
   * @returns The normalized event.
   */
  private normalizeEvent (rawEvent: TencentScfHttpEvent): { headers: IncomingHttpHeaders, body: unknown } {
    const headers = normalizeHeaders(rawEvent)
    let body: unknown = rawEvent.body

    if (typeof rawEvent.body === 'string') {
      body = rawEvent.isBase64Encoded === true
        ? Buffer.from(rawEvent.body, 'base64')
        : Buffer.from(rawEvent.body, 'utf-8')
    }

    return {
      body,
      headers: {
        'content-type': headers['content-type'],
        'content-length': headers['content-length'],
        'transfer-encoding': headers['transfer-encoding']
      }
    }
  }
}

/**
 * Meta Middleware for processing files uploads.
 */
export const MetaFilesEventMiddleware: MetaMiddleware<any, any> = { module: FilesEventMiddleware, isClass: true }
