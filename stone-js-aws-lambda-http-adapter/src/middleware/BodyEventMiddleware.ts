import bytes from 'bytes'
import typeIs from 'type-is'
import { IncomingMessage } from 'node:http'
import { getRawBody, normalizeHeaders } from '../event-normalizer'
import { isMultipart, getCharset } from '@stone-js/http-core'
import { IBlueprint, isNotEmpty, NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { AwsLambdaHttpAdapterError } from '../errors/AwsLambdaHttpAdapterError'
import { AwsLambdaHttpAdapterContext, AwsLambdaHttpAdapterResponseBuilder, AwsLambdaHttpEvent } from '../declarations'

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
   * @throws {AwsLambdaHttpAdapterError} If required components such as the rawEvent or IncomingEventBuilder are not provided.
   */
  async handle (context: AwsLambdaHttpAdapterContext, next: NextMiddleware<AwsLambdaHttpAdapterContext, AwsLambdaHttpAdapterResponseBuilder>): Promise<AwsLambdaHttpAdapterResponseBuilder> {
    if (context.rawEvent === undefined || context.incomingEventBuilder?.add === undefined) {
      throw new AwsLambdaHttpAdapterError('The context is missing required components.')
    }

    if (!isMultipart(this.toNodeMessage(context.rawEvent))) {
      const body = this.getBody(this.toNodeMessage(context.rawEvent), context.rawEvent)
      const method = this.extractSpoofedMethod(body)

      context
        .incomingEventBuilder
        .add('body', body)
        // Keep the untouched payload available even after parsing (webhook signatures, etc.).
        .add('metadata', { rawBody: getRawBody(context.rawEvent) })
        // In fullstack forms, the method is spoofed and sent as a hidden field.
      isNotEmpty(method) && context.incomingEventBuilder.add('method', method)
    }

    return await next(context)
  }

  /**
   * Extract a spoofed HTTP method from a parsed body, supporting both JSON objects and
   * urlencoded bodies (whose fields live on a `URLSearchParams`, not as own properties).
   *
   * @param body - The parsed body.
   * @returns The spoofed method, or undefined.
   */
  private extractSpoofedMethod (body: unknown): string | undefined {
    if (body instanceof URLSearchParams) { return body.get('$method$') ?? undefined }
    if (typeof body === 'object' && body !== null) { return (body as Record<string, any>).$method$ }
    return undefined
  }

  /**
   * Convert the raw event into a Node.js IncomingMessage.
   *
   * @param rawEvent - The raw event from the platform.
   * @returns The converted IncomingMessage.
   */
  private toNodeMessage (rawEvent: AwsLambdaHttpEvent): IncomingMessage {
    const headers = normalizeHeaders(rawEvent)
    return {
      headers: {
        'content-type': headers['content-type'],
        'content-length': headers['content-length'],
        'transfer-encoding': headers['transfer-encoding']
      }
    } as unknown as IncomingMessage
  }

  /**
   * Extract and parse the body from the message.
   *
   * @param message - The incoming HTTP message.
   * @returns A Promise resolving to the parsed body.
   * @throws {AwsLambdaHttpAdapterError} If the body parsing fails or is invalid.
   */
  private getBody (message: IncomingMessage, rawEvent: AwsLambdaHttpEvent): unknown {
    if (!typeIs.hasBody(message)) {
      return {}
    }

    const defaultOptions = { limit: '100kb', defaultType: 'text/plain', defaultCharset: 'utf-8' }
    const { defaultType, defaultCharset, limit: rawLimit } = this.blueprint.get<HttpBodyOptions>('stone.http.body', defaultOptions)
    const limit = bytes.parse(rawLimit) ?? 100000
    const encoding = getCharset(message, defaultCharset) as BufferEncoding
    const type = typeIs(message, ['urlencoded', 'json', 'text', 'bin']) ?? defaultType

    // Decode ONCE to a Buffer. Binary payloads must never round-trip through a lossy UTF-8 string
    // (which corrupts any non-UTF-8 byte); the limit is measured on the true byte length.
    const rawBuffer = this.getRawBuffer(rawEvent, encoding)

    if (rawBuffer.byteLength > limit) {
      throw new AwsLambdaHttpAdapterError('Body payload exceeds configured limit.')
    }

    return this.parseBodyContent(type, rawBuffer, encoding)
  }

  /**
   * Decode the request body into a Buffer, honouring base64 encoding.
   *
   * @param rawEvent - The raw event containing the body.
   * @param encoding - The charset for a plain-text (non-base64) body.
   * @returns The body as a Buffer.
   */
  private getRawBuffer (rawEvent: AwsLambdaHttpEvent, encoding: BufferEncoding): Buffer {
    if (typeof rawEvent.body === 'string') {
      return rawEvent.isBase64Encoded === true
        ? Buffer.from(rawEvent.body, 'base64')
        : Buffer.from(rawEvent.body, encoding)
    }

    if (typeof rawEvent.body === 'object' && rawEvent.body !== null) {
      return Buffer.from(JSON.stringify(rawEvent.body), encoding)
    }

    return Buffer.alloc(0)
  }

  /**
   * Parse the body content based on the specified type and encoding.
   *
   * @param type - The content type of the body.
   * @param buffer - The raw body content as a Buffer.
   * @param encoding - The encoding of the body content.
   * @returns The parsed body content as an object, string, or Buffer.
   * @throws {AwsLambdaHttpAdapterError} If parsing fails.
   */
  private parseBodyContent (type: string | false, buffer: Buffer, encoding: BufferEncoding): unknown {
    try {
      switch (type) {
        case 'json': {
          const text = buffer.toString(encoding)
          return isNotEmpty(text) ? JSON.parse(text) : {}
        }
        case 'text':
          return buffer.toString(encoding)
        case 'urlencoded':
          return new URLSearchParams(buffer.toString(encoding))
        case 'bin':
          return buffer // Return the raw bytes untouched — no lossy re-encoding.
        default:
          return {}
      }
    } catch (error: any) {
      throw new AwsLambdaHttpAdapterError('Failed to parse request body.', { cause: error })
    }
  }
}

/**
 * Meta Middleware for processing the request body.
 */
export const MetaBodyEventMiddleware: MetaMiddleware<any, any> = { module: BodyEventMiddleware, isClass: true }
