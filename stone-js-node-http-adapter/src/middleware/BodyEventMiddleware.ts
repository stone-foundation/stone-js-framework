import bytes from 'bytes'
import typeIs from 'type-is'
import rawBody from 'raw-body'
import bodyParser from 'co-body'
import { IncomingMessage } from 'node:http'
import { resolveMethodOverride } from '../method-override'
import { IBlueprint, NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { isMultipart, getCharset } from '@stone-js/http-core'
import { NodeHttpAdapterError } from '../errors/NodeHttpAdapterError'
import { NodeHttpAdapterContext, NodeHttpAdapterResponseBuilder } from '../declarations'

/**
 * Represents the configuration options for parsing the request body.
 */
interface HttpBodyOptions {
  limit: string
  defaultType: string
  defaultCharset: string
}

/**
 * Class representing a BodyEventMiddleware.
 *
 * This middleware handles platform-specific messages and transforms them into Stone.js IncomingEvent objects.
 *
 * @author Mr. Stone
 */
export class BodyEventMiddleware {
  /**
   * The blueprint for resolving configuration and dependencies.
   */
  private readonly blueprint: IBlueprint

  /**
   * Create a BodyEventMiddleware.
   *
   * @param {blueprint} options - Options for creating the BodyEventMiddleware.
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

    if (!isMultipart(context.rawEvent)) {
      const { body, rawBody } = await this.getBody(context.rawEvent)

      context
        .incomingEventBuilder
        .add('body', body)
        // Expose the untouched payload (webhook signatures, etc.) without confusing it with the
        // parsed body — instead of dumping the whole parsed body into metadata.
        .add('metadata', { rawBody })

      // In fullstack forms, the method is spoofed; only honour a safe, gated override.
      const method = resolveMethodOverride(this.blueprint, context.rawEvent, (body as any)?.$method$)
      if (method !== undefined) { context.incomingEventBuilder.add('method', method) }
    }

    return await next(context)
  }

  /**
   * Extract and parse the body from the message.
   *
   * @param message - The incoming HTTP message.
   * @returns A Promise resolving to the parsed body.
   * @throws {NodeHttpAdapterError} If the body parsing fails or is invalid.
   */
  private async getBody (message: IncomingMessage): Promise<{ body: unknown, rawBody?: string | Buffer }> {
    if (!typeIs.hasBody(message)) {
      return { body: {} }
    }

    const defaultOptions = { limit: '100kb', defaultType: 'text/plain', defaultCharset: 'utf-8' }
    const { defaultType, defaultCharset, limit: rawLimit } = this.blueprint.get<HttpBodyOptions>('stone.http.body', defaultOptions)
    const limit = bytes.parse(rawLimit) ?? 100000
    const length = message.headers['content-length']
    const encoding = getCharset(message, defaultCharset)

    try {
      switch (typeIs(message, ['urlencoded', 'json', 'text', 'bin']) ?? defaultType) {
        case 'bin': {
          const buffer = await rawBody(message, { length, limit })
          return { body: buffer, rawBody: buffer }
        }
        case 'json': {
          const { parsed, raw } = await bodyParser.json(message, { limit, encoding, returnRawBody: true })
          return { body: parsed, rawBody: raw }
        }
        case 'text': {
          const { parsed, raw } = await bodyParser.text(message, { limit, encoding, returnRawBody: true })
          return { body: parsed, rawBody: raw }
        }
        case 'urlencoded': {
          const { parsed, raw } = await bodyParser.form(message, { limit, encoding, returnRawBody: true })
          return { body: parsed, rawBody: raw }
        }
        default:
          return { body: {} }
      }
    } catch (error: any) {
      // Surface the real parsing cause (payload too large, invalid JSON…) instead of a copy-paste.
      throw new NodeHttpAdapterError(`Failed to parse the request body: ${String(error?.message ?? error)}`, { cause: error })
    }
  }
}

/**
 * Meta Middleware for processing the request body.
 */
export const MetaBodyEventMiddleware: MetaMiddleware<any, any> = { module: BodyEventMiddleware, isClass: true }
