import { HTTP_NOT_MODIFIED } from './constants'
import contentDisposition from 'content-disposition'
import { IncomingHttpEvent } from './IncomingHttpEvent'
import { IBlueprint, IContainer } from '@stone-js/core'
import { File, FilesystemError } from '@stone-js/filesystem'
import { OutgoingHttpResponse, OutgoingHttpResponseOptions } from './OutgoingHttpResponse'

/**
 * Options for creating a BinaryFile HTTP Response.
 */
export interface BinaryFileResponseOptions extends OutgoingHttpResponseOptions {
  autoEtag?: boolean
  file: string | File
  autoEncoding?: boolean
  autoLastModified?: boolean
  contentDispositionType?: string
}

/**
 * Class representing a BinaryFileResponse.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class BinaryFileResponse extends OutgoingHttpResponse {
  static readonly OUTGOING_HTTP_RESPONSE = 'stonejs@outgoing_http_binary_file_response'
  public readonly file: File
  private deleteFileAfterSent = false

  /**
   * Create a BinaryFileResponse with inline content disposition.
   *
   * @param options - Options for creating the BinaryFileResponse.
   * @returns A new instance of BinaryFileResponse.
   */
  static file (options: BinaryFileResponseOptions): BinaryFileResponse {
    return new this({ ...options, contentDispositionType: 'inline' })
  }

  /**
   * Create a BinaryFileResponse with attachment content disposition.
   *
   * @param options - Options for creating the BinaryFileResponse.
   * @returns A new instance of BinaryFileResponse.
   */
  static download (options: BinaryFileResponseOptions): BinaryFileResponse {
    return new this({ ...options, contentDispositionType: 'attachment' })
  }

  /**
   * Create a BinaryFileResponse.
   *
   * @param options - Options for creating the BinaryFileResponse.
   */
  constructor (options: BinaryFileResponseOptions) {
    super(options)
    this.file = this.getValidatedFile(options.file)

    options.autoEtag === true && this.autoEtag()
    options.autoEncoding === true && this.autoEncoding()
    options.autoLastModified === true && this.autoLastModified()

    this.setContentDisposition(options.contentDispositionType)
  }

  /**
   * Get deleteFileAfterSent.
   *
   * @returns Whether the file should be deleted after being sent.
   */
  get deleteFileAfterSentStatus (): boolean {
    return this.deleteFileAfterSent
  }

  /**
   * Get the encoded file path.
   *
   * @returns The encoded file path.
   */
  getEncodedFilePath (): string {
    return this.file.getEncodedPath()
  }

  /**
   * Automatically set the ETag header based on the file's content.
   *
   * @returns The current instance for method chaining.
   */
  autoEtag (): this {
    return this.setEtag(Buffer.from(this.file.getHashedContent()).toString('base64'))
  }

  /**
   * Automatically set the Last-Modified header based on the file's modification time.
   *
   * @returns The current instance for method chaining.
   */
  autoLastModified (): this {
    return this.setLastModified(new Date(Number(this.file.getMTime() ?? Date.now())))
  }

  /**
   * Automatically set the Content-Encoding header based on the file's extension.
   *
   * @returns The current instance for method chaining.
   */
  autoEncoding (): this {
    const encoding: Record<string, string> = { '.br': 'br', '.brotli': 'br', '.gzip': 'gzip' }

    if (this.file.isCompressed(Object.keys(encoding))) {
      return this.setHeader('Content-Encoding', encoding[this.file.getExtension()])
    }

    return this
  }

  /**
   * Set the content disposition header.
   *
   * @param type - The content disposition type (e.g., 'inline', 'attachment').
   * @returns The current instance for method chaining.
   */
  setContentDisposition (type?: string): this {
    return this
      .setHeader('Content-Disposition', contentDisposition(this.file.getPath(), { type }))
      .setHeader('Content-Type', this.file.getMimeType() ?? 'application/octet-stream')
  }

  /**
   * Set the content of the response.
   *
   * @param content - The content to set (should be empty for BinaryFileResponse).
   * @returns The current instance for method chaining.
   * @throws TypeError if content is provided.
   */
  setContent (content: unknown): this {
    if (content !== undefined) {
      throw new FilesystemError('The content cannot be set on a BinaryFileResponse instance.')
    }

    return this
  }

  /**
   * Get the content of the response.
   *
   * @returns False, as content cannot be set for BinaryFileResponse.
   */
  getContent (): false {
    return false
  }

  /**
   * Set whether the file should be deleted after being sent.
   *
   * @param shouldDelete - Whether to delete the file after being sent.
   * @returns The current instance for method chaining.
   */
  setDeleteFileAfterSent (shouldDelete: boolean = true): this {
    this.deleteFileAfterSent = shouldDelete
    return this
  }

  /**
   * Prepare the response before sending.
   *
   * @param event - The incoming HTTP event.
   * @param container - The service container.
   * @returns The current instance of the response for chaining.
   */
  prepare (event: IncomingHttpEvent, container?: IContainer): this | Promise<this> {
    this
      .setBlueprintResolver(() => container?.make<IBlueprint>('blueprint'))
      .setIncomingEventResolver(() => event)
      .prepareCookies()

    if (this.incomingEvent.isFresh(this)) {
      this.setStatus(HTTP_NOT_MODIFIED)
    }

    if (this.is1xx() || this.isEmpty()) {
      this.removeHeader(['Content-Type', 'Content-Length', 'Transfer-Encoding'])
    } else {
      this.prepareContentHeaders()
    }

    return this.setPrepared(true)
  }

  /**
   * Prepare content-related headers.
   *
   * @returns The current instance for method chaining.
   */
  protected prepareContentHeaders (): this {
    const fileSize = this.file.getSize()
    if (fileSize === undefined) return this

    this.removeHeader('Transfer-Encoding').setHeader('Content-Length', String(fileSize))

    // Weak validator from size + mtime — never read the whole file into memory to hash it (that
    // would defeat streaming for large files). Callers wanting a strong content hash can call
    // `autoEtag()` explicitly.
    if (!this.hasHeader('ETag')) {
      const mtime = this.file.getMTime() ?? 0
      this.setEtag(`${String(fileSize)}-${String(mtime)}`, true)
    }

    if (!this.hasHeader('Content-Type')) {
      this.setHeader('Content-Type', this.file.getMimeType() ?? 'application/octet-stream')
    }

    return this
  }

  /**
   * Validate the file to be served.
   *
   * @param file - The file to be served.
   * @returns The validated file instance.
   */
  private getValidatedFile (file: string | File): File {
    if (file === undefined) {
      throw new FilesystemError('file argument is required.')
    }

    if (!(file instanceof File)) {
      file = File.create(String(file))
    }

    if (!file.isReadable()) {
      throw new FilesystemError('File must be readable.')
    }

    return file
  }
}
