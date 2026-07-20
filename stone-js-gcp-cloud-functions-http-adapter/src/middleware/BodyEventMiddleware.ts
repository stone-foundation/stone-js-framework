import bytes from 'bytes'
import typeIs from 'type-is'
import rawBody from 'raw-body'
import bodyParser from 'co-body'
import querystring from 'node:querystring'
import { resolveMethodOverride } from '../method-override'
import { IBlueprint, NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { isMultipart, getCharset } from '@stone-js/http-core'
import { GcpCloudFunctionsHttpAdapterError } from '../errors/GcpCloudFunctionsHttpAdapterError'
import { GcpHttpFunctionRequest, GcpCloudFunctionsHttpAdapterContext, GcpCloudFunctionsHttpAdapterResponseBuilder } from '../declarations'

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
 * An opt-in building block for apps that want Stone.js body parsing (limit, type detection, method
 * override) instead of relying on the Functions Framework body-parser. On GCP the request stream is
 * consumed before the handler runs, so this reads the framework-parsed `body`/`rawBody` and only
 * falls back to reading the live stream for local invocations.
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
   * @throws {GcpCloudFunctionsHttpAdapterError} If required components such as the rawEvent or IncomingEventBuilder are not provided.
   */
  async handle (context: GcpCloudFunctionsHttpAdapterContext, next: NextMiddleware<GcpCloudFunctionsHttpAdapterContext, GcpCloudFunctionsHttpAdapterResponseBuilder>): Promise<GcpCloudFunctionsHttpAdapterResponseBuilder> {
    if (context.rawEvent === undefined || context.incomingEventBuilder?.add === undefined) {
      throw new GcpCloudFunctionsHttpAdapterError('The context is missing required components.')
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
   * @param message - The incoming GCP Cloud Functions HTTP request.
   * @returns A Promise resolving to the parsed body.
   * @throws {GcpCloudFunctionsHttpAdapterError} If the body parsing fails or is invalid.
   */
  private async getBody (message: GcpHttpFunctionRequest): Promise<{ body: unknown, rawBody?: string | Buffer }> {
    // The Functions Framework already parsed JSON/urlencoded/text bodies before the handler runs.
    if (message.body !== undefined && message.body !== null) {
      const raw = message.rawBody
      return { body: message.body, rawBody: raw === undefined ? undefined : raw.toString('utf-8') }
    }

    if (!typeIs.hasBody(message)) {
      return { body: {} }
    }

    const defaultOptions = { limit: '100kb', defaultType: 'text/plain', defaultCharset: 'utf-8' }
    const { defaultType, defaultCharset, limit: rawLimit } = this.blueprint.get<HttpBodyOptions>('stone.http.body', defaultOptions)
    const limit = bytes.parse(rawLimit) ?? 100000
    const encoding = getCharset(message, defaultCharset)

    try {
      // GCP exposes the untouched payload on `rawBody`; parse it directly. The framework consumes the
      // stream (so it cannot be re-read) and `rawBody` is already decoded (so no re-inflation).
      if (Buffer.isBuffer(message.rawBody)) {
        return this.parseRawBody(message, message.rawBody, limit, encoding, defaultType)
      }

      // Fallback: the stream is still readable (local invocation without the Functions Framework).
      const length = message.headers['content-length']
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
      throw new GcpCloudFunctionsHttpAdapterError(`Failed to parse the request body: ${String(error?.message ?? error)}`, { cause: error })
    }
  }

  /**
   * Parse the already-buffered `rawBody` (GCP path) by content type, enforcing the configured limit.
   *
   * @param message - The incoming request (for content-type detection).
   * @param buffer - The untouched request payload captured by the Functions Framework.
   * @param limit - The maximum allowed body size, in bytes.
   * @param encoding - The charset to decode text payloads with.
   * @param defaultType - The fallback content type when none matches.
   * @returns The parsed body and its raw form.
   */
  private parseRawBody (message: GcpHttpFunctionRequest, buffer: Buffer, limit: number, encoding: string, defaultType: string): { body: unknown, rawBody: string | Buffer } {
    if (buffer.length > limit) {
      throw new Error(`request entity too large (limit ${limit} bytes)`)
    }

    const type = typeIs(message, ['urlencoded', 'json', 'text', 'bin']) ?? defaultType

    if (type === 'bin') {
      return { body: buffer, rawBody: buffer }
    }

    const text = buffer.toString(encoding as BufferEncoding)

    switch (type) {
      case 'json':
        return { body: text.trim().length === 0 ? {} : JSON.parse(text), rawBody: text }
      case 'urlencoded':
        return { body: querystring.parse(text), rawBody: text }
      case 'text':
        return { body: text, rawBody: text }
      default:
        return { body: {}, rawBody: text }
    }
  }
}

/**
 * Meta Middleware for processing the request body.
 */
export const MetaBodyEventMiddleware: MetaMiddleware<any, any> = { module: BodyEventMiddleware, isClass: true }
