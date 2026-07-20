import { Readable } from 'node:stream'
import { IncomingMessage } from 'node:http'
import { IBlueprint, NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { resolveMethodOverride } from '../method-override'
import { isMultipart, getFilesUploads } from '@stone-js/http-core'
import { GcpCloudFunctionsHttpAdapterError } from '../errors/GcpCloudFunctionsHttpAdapterError'
import { GcpHttpFunctionRequest, GcpCloudFunctionsHttpAdapterContext, GcpCloudFunctionsHttpAdapterResponseBuilder } from '../declarations'

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
   * @throws {GcpCloudFunctionsHttpAdapterError} If required components such as the rawEvent or IncomingEventBuilder are not provided.
   */
  async handle (context: GcpCloudFunctionsHttpAdapterContext, next: NextMiddleware<GcpCloudFunctionsHttpAdapterContext, GcpCloudFunctionsHttpAdapterResponseBuilder>): Promise<GcpCloudFunctionsHttpAdapterResponseBuilder> {
    if (context.rawEvent === undefined || context.incomingEventBuilder?.add === undefined) {
      throw new GcpCloudFunctionsHttpAdapterError('The context is missing required components.')
    }

    if (isMultipart(context.rawEvent)) {
      const options = this.blueprint.get<Record<string, any>>('stone.http.files.upload', {})
      const response = await getFilesUploads(this.resolveMultipartSource(context.rawEvent), options)

      context
        .incomingEventBuilder
        .add('files', response.files)
        .add('body', response.fields)

      // In fullstack forms, the method is spoofed; only honour a safe, gated override.
      const method = resolveMethodOverride(this.blueprint, context.rawEvent, response.fields.$method$)
      if (method !== undefined) { context.incomingEventBuilder.add('method', method) }
    }

    return await next(context)
  }

  /**
   * Resolve a readable multipart source for the upload parser.
   *
   * The Functions Framework does not parse multipart bodies but consumes the request stream and
   * exposes the untouched bytes on `rawBody`. When `rawBody` is present, rebuild a readable that
   * carries the original headers (the parser reads the `content-type` boundary from them) so the
   * multipart parser sees an intact stream. Locally (no framework) the live request stream is used.
   *
   * @param rawEvent - The incoming GCP Cloud Functions HTTP request.
   * @returns A readable, header-carrying source for the multipart parser.
   */
  private resolveMultipartSource (rawEvent: GcpHttpFunctionRequest): IncomingMessage {
    if (!Buffer.isBuffer(rawEvent.rawBody)) {
      return rawEvent
    }

    const source = Readable.from(rawEvent.rawBody) as unknown as IncomingMessage & Record<string, any>
    source.headers = rawEvent.headers
    return source
  }
}

/**
 * Meta Middleware for processing files uploads.
 */
export const MetaFilesEventMiddleware: MetaMiddleware<any, any> = { module: FilesEventMiddleware, isClass: true }
