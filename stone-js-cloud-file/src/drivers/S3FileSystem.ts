import mime from 'mime'
import type { Readable } from 'node:stream'
import { CloudFileError } from '../errors/CloudFileError'
import type { S3DriverOptions } from '../declarations'
import { trimSlashes, trimTrailingSlashes } from '../utils'
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
 * S3 (and S3-compatible) storage driver.
 *
 * Implements the agnostic {@link FileSystem} contract plus {@link SignedUrlCapable} against Amazon
 * S3 and any S3-compatible store (Cloudflare R2, MinIO, DigitalOcean Spaces, Alibaba OSS, Tencent
 * COS) via a custom `endpoint`. The AWS SDK is imported **lazily** and is an optional peer
 * dependency, so this module carries no cloud SDK weight until an S3 disk is actually used.
 */
export class S3FileSystem implements FileSystem, SignedUrlCapable {
  readonly name: string

  private readonly bucket: string
  private readonly prefix: string
  private readonly baseUrl?: string
  private readonly expiresIn: number
  private readonly options: S3DriverOptions
  private clientPromise?: Promise<any>
  private sdkPromise?: Promise<any>
  private presignerPromise?: Promise<any>

  /**
   * Create an S3 driver.
   *
   * @param options - The S3 disk options.
   * @returns A new driver.
   */
  static create (options: S3DriverOptions): S3FileSystem {
    return new this(options)
  }

  /**
   * @param options - The S3 disk options.
   */
  constructor (options: S3DriverOptions) {
    if (typeof options?.bucket !== 'string' || options.bucket.length === 0) {
      throw new CloudFileError('An S3 disk requires a `bucket`.')
    }
    this.options = options
    this.name = options.name ?? 's3'
    this.bucket = options.bucket
    this.baseUrl = options.baseUrl
    this.expiresIn = options.signedUrlExpiresIn ?? DEFAULT_EXPIRES_IN
    // A root acts as a key prefix within the bucket; normalized without leading/trailing slashes.
    this.prefix = trimSlashes(options.root ?? '')
  }

  /** @inheritdoc */
  async exists (path: string): Promise<boolean> {
    const { HeadObjectCommand } = await this.sdk()
    try {
      await (await this.client()).send(new HeadObjectCommand({ Bucket: this.bucket, Key: this.key(path) }))
      return true
    } catch (error: any) {
      if (this.isNotFound(error)) { return false }
      throw this.wrap(error, `Failed to stat "${path}"`)
    }
  }

  /** @inheritdoc */
  async get (path: string): Promise<Buffer> {
    const { GetObjectCommand } = await this.sdk()
    try {
      const output = await (await this.client()).send(new GetObjectCommand({ Bucket: this.bucket, Key: this.key(path) }))
      return Buffer.from(await output.Body.transformToByteArray())
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
    const { PutObjectCommand } = await this.sdk()
    try {
      await (await this.client()).send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.key(path),
        Body: content,
        ContentType: mime.getType(path) ?? undefined
      }))
    } catch (error: any) {
      throw this.wrap(error, `Failed to write "${path}"`)
    }
  }

  /** @inheritdoc */
  async delete (path: string): Promise<boolean> {
    const { DeleteObjectCommand } = await this.sdk()
    const existed = await this.exists(path)
    if (!existed) { return false }
    try {
      await (await this.client()).send(new DeleteObjectCommand({ Bucket: this.bucket, Key: this.key(path) }))
      return true
    } catch (error: any) {
      throw this.wrap(error, `Failed to delete "${path}"`)
    }
  }

  /** @inheritdoc */
  async copy (source: string, destination: string): Promise<void> {
    const { CopyObjectCommand } = await this.sdk()
    try {
      await (await this.client()).send(new CopyObjectCommand({
        Bucket: this.bucket,
        Key: this.key(destination),
        CopySource: `${this.bucket}/${this.key(source)}`
      }))
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
    const { HeadObjectCommand } = await this.sdk()
    try {
      const head = await (await this.client()).send(new HeadObjectCommand({ Bucket: this.bucket, Key: this.key(path) }))
      return {
        path,
        size: head.ContentLength ?? 0,
        lastModified: head.LastModified instanceof Date ? head.LastModified.getTime() : undefined,
        mimeType: head.ContentType ?? mime.getType(path) ?? undefined,
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
      return `${trimTrailingSlashes(this.baseUrl)}/${this.key(path)}`
    }
    if (typeof this.options.endpoint === 'string' && this.options.endpoint.length > 0) {
      const base = trimTrailingSlashes(this.options.endpoint)
      return this.options.forcePathStyle === true ? `${base}/${this.bucket}/${this.key(path)}` : `${base}/${this.key(path)}`
    }
    return `https://${this.bucket}.s3.${this.options.region ?? 'us-east-1'}.amazonaws.com/${this.key(path)}`
  }

  /** @inheritdoc */
  async files (directory: string = '', recursive: boolean = true): Promise<string[]> {
    const { ListObjectsV2Command } = await this.sdk()
    const client = await this.client()
    // `key()` already applies the disk root prefix, so this is the full listing prefix.
    const prefix = trimTrailingSlashes(this.key(directory))
    const listPrefix = prefix.length > 0 ? `${prefix}/` : ''
    const out: string[] = []
    let token: string | undefined

    try {
      do {
        const page = await client.send(new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: listPrefix,
          Delimiter: recursive ? undefined : '/',
          ContinuationToken: token
        }))
        for (const item of page.Contents ?? []) {
          if (typeof item.Key === 'string') { out.push(this.unkey(item.Key)) }
        }
        token = page.IsTruncated === true ? page.NextContinuationToken : undefined
      } while (token !== undefined)
    } catch (error: any) {
      throw this.wrap(error, `Failed to list "${directory}"`)
    }

    return out
  }

  /**
   * No-op for object stores: prefixes are implicit and created on write. Present to satisfy the
   * {@link FileSystem} contract.
   */
  async makeDirectory (_path: string): Promise<void> {
    // Object stores have no real directories; nothing to create.
  }

  /** @inheritdoc */
  async readStream (path: string): Promise<Readable> {
    const { GetObjectCommand } = await this.sdk()
    try {
      const output = await (await this.client()).send(new GetObjectCommand({ Bucket: this.bucket, Key: this.key(path) }))
      const body: Readable = output.Body
      return body
    } catch (error: any) {
      throw this.wrap(error, `Failed to open "${path}"`)
    }
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
    const { GetObjectCommand } = await this.sdk()
    const { getSignedUrl } = await this.presigner()
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: this.key(path),
      ResponseContentType: options.responseContentType,
      ResponseContentDisposition: options.responseContentDisposition
    })
    const signed: string = await getSignedUrl(await this.client(), command, { expiresIn: options.expiresIn ?? this.expiresIn })
    return signed
  }

  /**
   * Mint a short-lived signed target to upload to `path` (direct-to-storage `PUT`).
   *
   * @param path - The destination object path.
   * @param options - Expiry and the content type to bind into the signature.
   * @returns The signed upload target.
   */
  async temporaryUploadUrl (path: string, options: TemporaryUploadUrlOptions = {}): Promise<SignedUpload> {
    const { PutObjectCommand } = await this.sdk()
    const { getSignedUrl } = await this.presigner()
    const expiresIn = options.expiresIn ?? this.expiresIn
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: this.key(path),
      ContentType: options.contentType,
      ContentLength: options.contentLength
    })
    const url = await getSignedUrl(await this.client(), command, { expiresIn })
    const headers: Record<string, string> = {}
    if (typeof options.contentType === 'string') { headers['content-type'] = options.contentType }
    return { url, method: 'PUT', headers, expiresIn }
  }

  /**
   * Resolve the full object key for a path (applies the disk's root prefix).
   *
   * @param path - The path relative to the disk root.
   * @returns The full S3 key.
   */
  private key (path: string): string {
    const clean = String(path).replace(/^\/+/, '')
    return this.prefix.length > 0 ? `${this.prefix}/${clean}` : clean
  }

  /**
   * Strip the disk's root prefix from a full key (inverse of {@link key}).
   *
   * @param key - The full S3 key.
   * @returns The path relative to the disk root.
   */
  private unkey (key: string): string {
    return this.prefix.length > 0 && key.startsWith(`${this.prefix}/`) ? key.slice(this.prefix.length + 1) : key
  }

  /**
   * Lazily load `@aws-sdk/client-s3` (an optional peer dependency).
   *
   * @returns The SDK module.
   * @throws {CloudFileError} When the SDK is not installed.
   */
  private async sdk (): Promise<any> {
    this.sdkPromise = this.sdkPromise ?? import('@aws-sdk/client-s3').catch(() => {
      throw new CloudFileError('The S3 driver requires "@aws-sdk/client-s3". Install it: npm i @aws-sdk/client-s3')
    })
    return await this.sdkPromise
  }

  /**
   * Lazily load `@aws-sdk/s3-request-presigner` (an optional peer dependency).
   *
   * @returns The presigner module.
   * @throws {CloudFileError} When the presigner is not installed.
   */
  private async presigner (): Promise<any> {
    this.presignerPromise = this.presignerPromise ?? import('@aws-sdk/s3-request-presigner').catch(() => {
      throw new CloudFileError('Signed URLs require "@aws-sdk/s3-request-presigner". Install it: npm i @aws-sdk/s3-request-presigner')
    })
    return await this.presignerPromise
  }

  /**
   * Lazily build (and memoize) the S3 client.
   *
   * @returns The S3 client.
   */
  private async client (): Promise<any> {
    this.clientPromise = this.clientPromise ?? this.sdk().then(({ S3Client }) => new S3Client({
      region: this.options.region,
      endpoint: this.options.endpoint,
      forcePathStyle: this.options.forcePathStyle,
      credentials: this.options.credentials
    }))
    return await this.clientPromise
  }

  /**
   * Whether an S3 error is a "not found" (404 / NoSuchKey / NotFound).
   *
   * @param error - The caught error.
   * @returns True when the object does not exist.
   */
  private isNotFound (error: any): boolean {
    const status = error?.$metadata?.httpStatusCode
    const codes = [error?.name, error?.Code, error?.code].map((value) => String(value ?? ''))
    return status === 404 || codes.includes('NotFound') || codes.includes('NoSuchKey')
  }

  /**
   * Wrap an SDK error in a {@link CloudFileError}, preserving the cause.
   *
   * @param error - The caught error.
   * @param message - The contextual message.
   * @returns A CloudFileError (returned so callers can `throw this.wrap(...)`).
   */
  private wrap (error: any, message: string): CloudFileError {
    if (error instanceof CloudFileError) { return error }
    return new CloudFileError(`${message}: ${String(error?.message ?? error)}`, { cause: error })
  }
}
