import { IBlueprint, NextMiddleware } from '@stone-js/core'
import { resolveMethodOverride } from '../method-override'
import { isMultipart, getFilesUploads } from '@stone-js/http-core'
import { NodeHttpAdapterError } from '../errors/NodeHttpAdapterError'
import { NodeHttpAdapterContext, NodeHttpAdapterResponseBuilder } from '../declarations'

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
   * @throws {NodeHttpAdapterError} If required components such as the rawEvent or IncomingEventBuilder are not provided.
   */
  async handle (context: NodeHttpAdapterContext, next: NextMiddleware<NodeHttpAdapterContext, NodeHttpAdapterResponseBuilder>): Promise<NodeHttpAdapterResponseBuilder> {
    if (context.rawEvent === undefined || context.incomingEventBuilder?.add === undefined) {
      throw new NodeHttpAdapterError('The context is missing required components.')
    }

    if (isMultipart(context.rawEvent)) {
      const options = this.blueprint.get<Record<string, any>>('stone.http.files.upload', {})
      const response = await getFilesUploads(context.rawEvent, options)

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
}

/**
 * Meta Middleware for processing files uploads.
 */
export const MetaFilesEventMiddleware = { module: FilesEventMiddleware, isClass: true }
