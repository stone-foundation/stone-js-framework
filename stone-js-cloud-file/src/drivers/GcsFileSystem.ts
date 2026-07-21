import mime from 'mime'
import type { Readable } from 'node:stream'
import { CloudFileError } from '../errors/CloudFileError'
import type { GcsDriverOptions } from '../declarations'
import type {
  FileSystem,
  StorageStat,
  SignedUpload,
  SignedUrlCapable,
  TemporaryUrlOptions,
  TemporaryUploadUrlOptions
} from '@stone-js/filesystem'

/** Default signed-URL expiry (15 minutes). */
const DEFAULT_EXPIRES_IN = 900

/**
 * Google Cloud Storage driver.
 *
 * Implements the agnostic {@link FileSystem} contract plus {@link SignedUrlCapable} against
 * `@google-cloud/storage`. The SDK is imported **lazily** and is an optional peer dependency, so
 * this module carries no GCS weight until a GCS disk is actually used.
 */
export class GcsFileSystem implements FileSystem, SignedUrlCapable {
  readonly name: string

  private readonly bucketName: string
  private readonly prefix: string
  private readonly baseUrl?: string
  private readonly expiresIn: number
  private readonly options: GcsDriverOptions
  private bucketPromise?: Promise<any>
  private sdkPromise?: Promise<any>

  /**
   * Create a GCS driver.
   *
   * @param options - The GCS disk options.
   * @returns A new driver.
   */
  static create (options: GcsDriverOptions): GcsFileSystem {
    return new this(options)
  }

  /**
   * @param options - The GCS disk options.
   */
  constructor (options: GcsDriverOptions) {
    if (typeof options?.bucket !== 'string' || options.bucket.length === 0) {
      throw new CloudFileError('A GCS disk requires a `bucket`.')
    }
    this.options = options
    this.name = options.name ?? 'gcs'
    this.bucketName = options.bucket
    this.baseUrl = options.baseUrl
    this.expiresIn = options.signedUrlExpiresIn ?? DEFAULT_EXPIRES_IN
    this.prefix = (options.root ?? '').replace(/^\/+|\/+$/g, '')
  }

  /** @inheritdoc */
  async exists (path: string): Promise<boolean> {
    try {
      const [exists] = await (await this.fileHandle(path)).exists()
      return exists === true
    } catch (error: any) {
      throw this.wrap(error, `Failed to stat "${path}"`)
    }
  }

  /** @inheritdoc */
  async get (path: string): Promise<Buffer> {
    try {
      const [contents] = await (await this.fileHandle(path)).download()
      return Buffer.from(contents)
    } catch (error: any) {
      throw this.wrap(error, `Failed to read "${path}"`)
    }
  }

  /** @inheritdoc */
  async getText (path: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return (await this.get(path)).toString(encoding)
  }

  /** @inheritdoc */
  async put (path: string, content: Buffer | string): Promise<void> {
    try {
      await (await this.fileHandle(path)).save(content, { contentType: mime.getType(path) ?? undefined })
    } catch (error: any) {
      throw this.wrap(error, `Failed to write "${path}"`)
    }
  }

  /** @inheritdoc */
  async delete (path: string): Promise<boolean> {
    const existed = await this.exists(path)
    if (!existed) { return false }
    try {
      await (await this.fileHandle(path)).delete()
      return true
    } catch (error: any) {
      throw this.wrap(error, `Failed to delete "${path}"`)
    }
  }

  /** @inheritdoc */
  async copy (source: string, destination: string): Promise<void> {
    try {
      await (await this.fileHandle(source)).copy(await this.fileHandle(destination))
    } catch (error: any) {
      throw this.wrap(error, `Failed to copy "${source}" to "${destination}"`)
    }
  }

  /** @inheritdoc */
  async move (source: string, destination: string): Promise<void> {
    await this.copy(source, destination)
    await this.delete(source)
  }

  /** @inheritdoc */
  async stat (path: string): Promise<StorageStat> {
    try {
      const [metadata] = await (await this.fileHandle(path)).getMetadata()
      return {
        path,
        size: Number(metadata.size ?? 0),
        lastModified: typeof metadata.updated === 'string' ? new Date(metadata.updated).getTime() : undefined,
        mimeType: metadata.contentType ?? mime.getType(path) ?? undefined,
        isFile: true,
        isDirectory: false
      }
    } catch (error: any) {
      throw this.wrap(error, `Failed to stat "${path}"`)
    }
  }

  /** @inheritdoc */
  async size (path: string): Promise<number> {
    return (await this.stat(path)).size
  }

  /** @inheritdoc */
  async lastModified (path: string): Promise<number | undefined> {
    return (await this.stat(path)).lastModified
  }

  /** @inheritdoc */
  async mimeType (path: string): Promise<string | undefined> {
    return (await this.stat(path)).mimeType
  }

  /** @inheritdoc */
  async url (path: string): Promise<string> {
    if (typeof this.baseUrl === 'string' && this.baseUrl.length > 0) {
      return `${this.baseUrl.replace(/\/+$/, '')}/${this.key(path)}`
    }
    return `https://storage.googleapis.com/${this.bucketName}/${this.key(path)}`
  }

  /** @inheritdoc */
  async files (directory: string = '', recursive: boolean = true): Promise<string[]> {
    const prefix = this.key(directory).replace(/\/+$/, '')
    const listPrefix = prefix.length > 0 ? `${prefix}/` : ''
    try {
      const [files] = await (await this.bucket()).getFiles({
        prefix: listPrefix,
        delimiter: recursive ? undefined : '/'
      })
      return files
        .map((file: any) => this.unkey(String(file.name)))
        .filter((name: string) => name.length > 0)
    } catch (error: any) {
      throw this.wrap(error, `Failed to list "${directory}"`)
    }
  }

  /**
   * No-op for object stores: prefixes are implicit and created on write.
   */
  async makeDirectory (_path: string): Promise<void> {
    // Object stores have no real directories; nothing to create.
  }

  /** @inheritdoc */
  async readStream (path: string): Promise<Readable> {
    const stream: Readable = (await this.fileHandle(path)).createReadStream()
    return stream
  }

  /** @inheritdoc */
  async writeStream (path: string, stream: Readable): Promise<void> {
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    await this.put(path, Buffer.concat(chunks))
  }

  /**
   * Mint a short-lived signed URL to download `path`.
   *
   * @param path - The object path.
   * @param options - Expiry and response-header overrides.
   * @returns The signed download URL.
   */
  async temporaryUrl (path: string, options: TemporaryUrlOptions = {}): Promise<string> {
    try {
      const [url] = await (await this.fileHandle(path)).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: this.expiresAt(options.expiresIn),
        responseType: options.responseContentType,
        responseDisposition: options.responseContentDisposition
      })
      return url
    } catch (error: any) {
      throw this.wrap(error, `Failed to sign "${path}"`)
    }
  }

  /**
   * Mint a short-lived signed target to upload to `path` (direct-to-storage `PUT`).
   *
   * @param path - The destination object path.
   * @param options - Expiry and the content type to bind into the signature.
   * @returns The signed upload target.
   */
  async temporaryUploadUrl (path: string, options: TemporaryUploadUrlOptions = {}): Promise<SignedUpload> {
    const expiresIn = options.expiresIn ?? this.expiresIn
    try {
      const [url] = await (await this.fileHandle(path)).getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + expiresIn * 1000,
        contentType: options.contentType
      })
      const headers: Record<string, string> = {}
      if (typeof options.contentType === 'string') { headers['content-type'] = options.contentType }
      return { url, method: 'PUT', headers, expiresIn }
    } catch (error: any) {
      throw this.wrap(error, `Failed to sign an upload for "${path}"`)
    }
  }

  /**
   * The full object key for a path (applies the disk's root prefix).
   *
   * @param path - The path relative to the disk root.
   * @returns The full object name.
   */
  private key (path: string): string {
    const clean = String(path).replace(/^\/+/, '')
    return this.prefix.length > 0 ? `${this.prefix}/${clean}` : clean
  }

  /**
   * Strip the disk's root prefix from a full object name.
   *
   * @param name - The full object name.
   * @returns The path relative to the disk root.
   */
  private unkey (name: string): string {
    return this.prefix.length > 0 && name.startsWith(`${this.prefix}/`) ? name.slice(this.prefix.length + 1) : name
  }

  /**
   * The signed-URL expiry as an epoch-ms timestamp.
   *
   * @param expiresIn - Seconds until expiry (driver default when omitted).
   * @returns The absolute expiry time in epoch milliseconds.
   */
  private expiresAt (expiresIn?: number): number {
    return Date.now() + (expiresIn ?? this.expiresIn) * 1000
  }

  /**
   * Resolve the GCS File handle for a path.
   *
   * @param path - The path relative to the disk root.
   * @returns A `@google-cloud/storage` File handle.
   */
  private async fileHandle (path: string): Promise<any> {
    return (await this.bucket()).file(this.key(path))
  }

  /**
   * Lazily load `@google-cloud/storage` (an optional peer dependency).
   *
   * @returns The SDK module.
   * @throws {CloudFileError} When the SDK is not installed.
   */
  private async sdk (): Promise<any> {
    this.sdkPromise = this.sdkPromise ?? import('@google-cloud/storage').catch(() => {
      throw new CloudFileError('The GCS driver requires "@google-cloud/storage". Install it: npm i @google-cloud/storage')
    })
    return await this.sdkPromise
  }

  /**
   * Lazily build (and memoize) the GCS bucket handle.
   *
   * @returns The bucket handle.
   */
  private async bucket (): Promise<any> {
    this.bucketPromise = this.bucketPromise ?? this.sdk().then(({ Storage }) => new Storage({
      projectId: this.options.projectId,
      keyFilename: this.options.keyFilename,
      credentials: this.options.credentials
    }).bucket(this.bucketName))
    return await this.bucketPromise
  }

  /**
   * Wrap an SDK error in a {@link CloudFileError}, preserving the cause.
   *
   * @param error - The caught error.
   * @param message - The contextual message.
   * @returns A CloudFileError.
   */
  private wrap (error: any, message: string): CloudFileError {
    if (error instanceof CloudFileError) { return error }
    return new CloudFileError(`${message}: ${String(error?.message ?? error)}`, { cause: error })
  }
}
