import { Readable } from 'node:stream'
import { ServerResponse } from 'node:http'
import { IRawResponseWrapper } from '@stone-js/core'
import { RawHttpResponseOptions } from './declarations'

/**
 * A wrapper for the Node.js HTTP `ServerResponse` to implement the `IRawResponseWrapper` interface.
 *
 * This class provides methods for configuring and sending HTTP responses in a consistent and
 * flexible manner. It supports setting status codes, headers, streaming files, or sending raw body content.
 */
export class ServerResponseWrapper implements IRawResponseWrapper<ServerResponse> {
  /**
   * Creates a new `ServerResponseWrapper` instance.
   *
   * @param response - The Node.js `ServerResponse` object to be wrapped.
   * @param options - Partial configuration for customizing the response.
   * @returns A new instance of `ServerResponseWrapper`.
   */
  static create (response: ServerResponse, options: Partial<RawHttpResponseOptions> = {}): ServerResponseWrapper {
    return new this(response, options)
  }

  /**
   * Constructs a `ServerResponseWrapper` instance.
   *
   * This constructor is private and intended to be used via the static `create` method.
   *
   * @param response - The Node.js `ServerResponse` object to be wrapped.
   * @param options - Partial configuration for customizing the response.
   */
  private constructor (
    public readonly response: ServerResponse,
    public readonly options: Partial<RawHttpResponseOptions> = {}
  ) {}

  /**
   * Sends the HTTP response based on the configured options.
   *
   * This method:
   * - Sets the `statusCode` and `statusMessage` if provided.
   * - Configures response `headers` if specified.
   * - Streams a file if `streamFile` is defined.
   * - Sends raw content if `body` is provided.
   *
   * @returns A promise that resolves to the HTTP status code of the response.
   *
   * @throws An error if the response cannot be sent due to an issue in `streamFile`.
   */
  async respond (): Promise<ServerResponse> {
    this
      .setStatus()
      .setHeaders()

    // A readable stream (streaming SSR / SSE) takes precedence over a buffered body.
    if (this.options.stream !== undefined) {
      return await this.sendStream()
    }

    this.sendBody()

    await this.streamFile()

    return this.hasBody() ? this.response : this.response.end()
  }

  /**
   * Pipe a readable stream (Web `ReadableStream` or Node `Readable`) into the response.
   *
   * Resolves once the response has finished; rejects (and destroys the response) if the
   * source stream errors mid-flight.
   *
   * @returns The response once fully written.
   */
  private async sendStream (): Promise<ServerResponse> {
    const source = this.options.stream
    const nodeStream = source instanceof Readable
      ? source
      : Readable.fromWeb(source as Parameters<typeof Readable.fromWeb>[0])

    await new Promise<void>((resolve, reject) => {
      nodeStream.on('error', (error) => {
        this.response.destroy(error)
        reject(error)
      })
      this.response.on('finish', resolve)
      this.response.on('close', resolve)
      nodeStream.pipe(this.response)
    })

    return this.response
  }

  /**
   * Sets the status code and status message of the response.
   *
   * If `statusCode` is not provided, the status code is not modified.
   */
  private setStatus (): this {
    if (this.options.statusCode !== undefined) {
      this.response.statusCode = this.options.statusCode
      this.response.statusMessage = this.options.statusMessage ?? ''
    }
    return this
  }

  /**
   * Sets the headers for the response.
   *
   * If `headers` are not provided, this method does nothing.
   */
  private setHeaders (): this {
    if (this.options.headers !== undefined) {
      this.response.setHeaders(this.options.headers)
    }
    return this
  }

  /**
   * Streams a file as the response body.
   *
   * @throws An error if the file streaming operation fails.
   */
  private async streamFile (): Promise<void> {
    if (this.options.streamFile !== undefined) {
      await this.options.streamFile()
    }
  }

  /**
   * Sends the raw body content of the response.
   *
   * If `body` is not provided, this method does nothing.
   */
  private sendBody (): this {
    if (this.options.body !== undefined) {
      this.response.end(this.options.body, (this.options.charset ?? 'utf-8') as BufferEncoding)
    }
    return this
  }

  /**
   * Determines if the response has a body.
   *
   * @returns `true` if the response has a body, `false` otherwise.
   */
  private hasBody (): boolean {
    return this.options.body !== undefined || this.options.streamFile !== undefined
  }
}
