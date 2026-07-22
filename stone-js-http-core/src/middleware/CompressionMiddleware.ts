import { IncomingHttpEvent } from '../IncomingHttpEvent'
import { isNotEmpty, NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { OutgoingHttpResponse } from '../OutgoingHttpResponse'

/**
 * Kernel Middleware to compress response content based on the Accept-Encoding header.
 */
export class CompressionMiddleware {
  /**
   * Compress the response content based on the Accept-Encoding header.
   *
   * @param event - The incoming HTTP event.
   * @param next - The next middleware in the pipeline.
   * @returns The outgoing HTTP response.
   */
  async handle (event: IncomingHttpEvent, next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>): Promise<OutgoingHttpResponse> {
    const response = await next(event)

    if (this.isCompressibleContent(response.content)) {
      const { content, encoding } = await this.compressContent(
        response.content,
        this.getCompressionFormatFromEvent(event)
      )

      if (isNotEmpty<string>(encoding)) {
        response.setContent(content)
        response.setHeader('Content-Encoding', encoding)
      }

      response.removeHeader('Content-Length')
      // Merge into Vary (never overwrite): a prior `Vary: Accept` from content negotiation must
      // survive, otherwise a shared cache can serve a wrongly-encoded/negotiated response.
      response.addVary('Accept-Encoding')
    }

    return response
  }

  /**
   * Determine the best compression format from the Accept-Encoding header.
   *
   * @param event - The incoming HTTP event.
   * @returns The best compression format to use.
   */
  private getCompressionFormatFromEvent (event: IncomingHttpEvent): 'gzip' | 'deflate' | 'br' | undefined {
    const acceptedEncodings = new Set(event
      .getHeader('accept-encoding', '')
      .split(',')
      .map(enc => enc.trim().toLowerCase()))

    const priorities: Array<'br' | 'gzip' | 'deflate'> = ['br', 'gzip', 'deflate']
    return priorities.find(encoding => acceptedEncodings.has(encoding))
  }

  /**
   * Compress content using the specified encoding.
   *
   * @param content - The content to compress.
   * @param encoding - The encoding to use (gzip, deflate, br).
   * @returns The compressed content.
   */
  private async compressContent (
    content: string | Buffer,
    encoding: 'gzip' | 'deflate' | 'br' | undefined
  ): Promise<{ content: Buffer, encoding?: 'gzip' | 'deflate' | 'br' }> {
    const { gzip, deflate, brotliCompress } = await import('node:zlib')
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8')

    try {
      return await new Promise((resolve, reject) => {
        switch (encoding) {
          case 'gzip':
            return gzip(buffer, (err, compressed) => ((err != null) ? reject(err) : resolve({ content: compressed, encoding })))
          case 'deflate':
            return deflate(buffer, (err, compressed) => ((err != null) ? reject(err) : resolve({ content: compressed, encoding })))
          case 'br':
            return brotliCompress(buffer, (err, compressed) => ((err != null) ? reject(err) : resolve({ content: compressed, encoding })))
          default:
            return resolve({ content: buffer })
        }
      })
    } catch {
      return { content: buffer }
    }
  }

  /**
   * Check if the content is compressible (string or Buffer).
   * Only compress Buffer content and string content that is larger than 1KB.
   *
   * @param content - The content to check.
   * @returns True if the content is compressible.
   */
  private isCompressibleContent (content: unknown): content is string | Buffer {
    return (typeof content === 'string' && content.length > 1000) || Buffer.isBuffer(content)
  }
}

/**
 * Meta Middleware for compressing response content.
 */
export const MetaCompressionMiddleware: MetaMiddleware = { module: CompressionMiddleware, isClass: true, global: true }
