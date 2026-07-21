import mime from 'mime'
import type { Readable } from 'node:stream'
import { CloudFileError } from '../errors/CloudFileError'
import type { AzureBlobDriverOptions } from '../declarations'
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
 * Azure Blob Storage driver.
 *
 * Implements the agnostic {@link FileSystem} contract plus {@link SignedUrlCapable} against
 * `@azure/storage-blob`. The SDK is imported **lazily** and is an optional peer dependency, so this
 * module carries no Azure weight until an Azure disk is actually used. Signed URLs (SAS) require the
 * account name and key.
 */
export class AzureBlobFileSystem implements FileSystem, SignedUrlCapable {
  readonly name: string

  private readonly containerName: string
  private readonly prefix: string
  private readonly baseUrl?: string
  private readonly expiresIn: number
  private readonly options: AzureBlobDriverOptions
  private containerPromise?: Promise<any>
  private sdkPromise?: Promise<any>

  /**
   * Create an Azure Blob driver.
   *
   * @param options - The Azure disk options.
   * @returns A new driver.
   */
  static create (options: AzureBlobDriverOptions): AzureBlobFileSystem {
    return new this(options)
  }

  /**
   * @param options - The Azure disk options.
   */
  constructor (options: AzureBlobDriverOptions) {
    if (typeof options?.container !== 'string' || options.container.length === 0) {
      throw new CloudFileError('An Azure Blob disk requires a `container`.')
    }
    this.options = options
    this.name = options.name ?? 'azure'
    this.containerName = options.container
    this.baseUrl = options.baseUrl
    this.expiresIn = options.signedUrlExpiresIn ?? DEFAULT_EXPIRES_IN
    this.prefix = (options.root ?? '').replace(/^\/+|\/+$/g, '')
  }

  /** @inheritdoc */
  async exists (path: string): Promise<boolean> {
    try {
      return await (await this.blob(path)).exists() === true
    } catch (error: any) {
      throw this.wrap(error, `Failed to stat "${path}"`)
    }
  }

  /** @inheritdoc */
  async get (path: string): Promise<Buffer> {
    try {
      return Buffer.from(await (await this.blob(path)).downloadToBuffer())
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
    const body = typeof content === 'string' ? Buffer.from(content) : content
    try {
      await (await this.blob(path)).uploadData(body, { blobHTTPHeaders: { blobContentType: mime.getType(path) ?? undefined } })
    } catch (error: any) {
      throw this.wrap(error, `Failed to write "${path}"`)
    }
  }

  /** @inheritdoc */
  async delete (path: string): Promise<boolean> {
    try {
      const result = await (await this.blob(path)).deleteIfExists()
      return result?.succeeded === true
    } catch (error: any) {
      throw this.wrap(error, `Failed to delete "${path}"`)
    }
  }

  /** @inheritdoc */
  async copy (source: string, destination: string): Promise<void> {
    // Copy by value (download + upload) to stay free of SAS/cross-account URL concerns.
    await this.put(destination, await this.get(source))
  }

  /** @inheritdoc */
  async move (source: string, destination: string): Promise<void> {
    await this.copy(source, destination)
    await this.delete(source)
  }

  /** @inheritdoc */
  async stat (path: string): Promise<StorageStat> {
    try {
      const props = await (await this.blob(path)).getProperties()
      return {
        path,
        size: Number(props.contentLength ?? 0),
        lastModified: props.lastModified instanceof Date ? props.lastModified.getTime() : undefined,
        mimeType: props.contentType ?? mime.getType(path) ?? undefined,
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
    return String((await this.blob(path)).url)
  }

  /** @inheritdoc */
  async files (directory: string = '', recursive: boolean = true): Promise<string[]> {
    const prefix = this.key(directory).replace(/\/+$/, '')
    const listPrefix = prefix.length > 0 ? `${prefix}/` : ''
    const out: string[] = []
    try {
      const container = await this.container()
      if (recursive) {
        for await (const blob of container.listBlobsFlat({ prefix: listPrefix })) {
          out.push(this.unkey(String(blob.name)))
        }
      } else {
        for await (const item of container.listBlobsByHierarchy('/', { prefix: listPrefix })) {
          if (item.kind === 'blob') { out.push(this.unkey(String(item.name))) }
        }
      }
    } catch (error: any) {
      throw this.wrap(error, `Failed to list "${directory}"`)
    }
    return out
  }

  /**
   * No-op for object stores: prefixes are implicit and created on write.
   */
  async makeDirectory (_path: string): Promise<void> {
    // Object stores have no real directories; nothing to create.
  }

  /** @inheritdoc */
  async readStream (path: string): Promise<Readable> {
    try {
      const response = await (await this.blob(path)).download()
      return response.readableStreamBody as Readable
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
   * Mint a short-lived signed (SAS) URL to download `path`.
   *
   * @param path - The object path.
   * @param options - Expiry and response-header overrides.
   * @returns The signed download URL.
   */
  async temporaryUrl (path: string, options: TemporaryUrlOptions = {}): Promise<string> {
    return await this.sign(path, 'r', options.expiresIn, {
      contentType: options.responseContentType,
      contentDisposition: options.responseContentDisposition
    })
  }

  /**
   * Mint a short-lived signed (SAS) target to upload to `path` (direct-to-storage `PUT`).
   *
   * @param path - The destination object path.
   * @param options - Expiry and the content type to bind into the signature.
   * @returns The signed upload target.
   */
  async temporaryUploadUrl (path: string, options: TemporaryUploadUrlOptions = {}): Promise<SignedUpload> {
    const expiresIn = options.expiresIn ?? this.expiresIn
    const url = await this.sign(path, 'cw', expiresIn, { contentType: options.contentType })
    const headers: Record<string, string> = { 'x-ms-blob-type': 'BlockBlob' }
    if (typeof options.contentType === 'string') { headers['content-type'] = options.contentType }
    return { url, method: 'PUT', headers, expiresIn }
  }

  /**
   * Generate a SAS URL for a blob with the given permissions.
   *
   * @param path - The object path.
   * @param permissions - The SAS permission string (`r`, `cw`, …).
   * @param expiresIn - Seconds until expiry.
   * @param headers - Response/content headers to bind into the SAS.
   * @returns The full SAS URL.
   * @throws {CloudFileError} When the account name/key are not configured.
   */
  private async sign (path: string, permissions: string, expiresIn: number | undefined, headers: { contentType?: string, contentDisposition?: string }): Promise<string> {
    const { accountName, accountKey } = this.options
    if (typeof accountName !== 'string' || typeof accountKey !== 'string') {
      throw new CloudFileError('Azure signed URLs require `accountName` and `accountKey`.')
    }

    const { generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = await this.sdk()
    const credential = new StorageSharedKeyCredential(accountName, accountKey)
    const ttl = (expiresIn ?? this.expiresIn) * 1000

    const sas: string = generateBlobSASQueryParameters({
      containerName: this.containerName,
      blobName: this.key(path),
      permissions: BlobSASPermissions.parse(permissions),
      expiresOn: new Date(Date.now() + ttl),
      contentType: headers.contentType,
      contentDisposition: headers.contentDisposition
    }, credential).toString()

    const url: string = String((await this.blob(path)).url)
    return `${url}?${sas}`
  }

  /**
   * The full blob key for a path (applies the disk's root prefix).
   *
   * @param path - The path relative to the disk root.
   * @returns The full blob name.
   */
  private key (path: string): string {
    const clean = String(path).replace(/^\/+/, '')
    return this.prefix.length > 0 ? `${this.prefix}/${clean}` : clean
  }

  /**
   * Strip the disk's root prefix from a full blob name.
   *
   * @param name - The full blob name.
   * @returns The path relative to the disk root.
   */
  private unkey (name: string): string {
    return this.prefix.length > 0 && name.startsWith(`${this.prefix}/`) ? name.slice(this.prefix.length + 1) : name
  }

  /**
   * Resolve the block-blob client for a path.
   *
   * @param path - The path relative to the disk root.
   * @returns A `@azure/storage-blob` BlockBlobClient.
   */
  private async blob (path: string): Promise<any> {
    return (await this.container()).getBlockBlobClient(this.key(path))
  }

  /**
   * Lazily load `@azure/storage-blob` (an optional peer dependency).
   *
   * @returns The SDK module.
   * @throws {CloudFileError} When the SDK is not installed.
   */
  private async sdk (): Promise<any> {
    this.sdkPromise = this.sdkPromise ?? import('@azure/storage-blob').catch(() => {
      throw new CloudFileError('The Azure Blob driver requires "@azure/storage-blob". Install it: npm i @azure/storage-blob')
    })
    return await this.sdkPromise
  }

  /**
   * Lazily build (and memoize) the container client.
   *
   * @returns The container client.
   * @throws {CloudFileError} When no connection string / account credentials are configured.
   */
  private async container (): Promise<any> {
    this.containerPromise = this.containerPromise ?? this.sdk().then((sdk) => {
      const { BlobServiceClient, StorageSharedKeyCredential } = sdk
      const { connectionString, accountName, accountKey } = this.options

      if (typeof connectionString === 'string' && connectionString.length > 0) {
        return BlobServiceClient.fromConnectionString(connectionString).getContainerClient(this.containerName)
      }

      if (typeof accountName === 'string' && typeof accountKey === 'string') {
        const credential = new StorageSharedKeyCredential(accountName, accountKey)
        const service = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential)
        return service.getContainerClient(this.containerName)
      }

      throw new CloudFileError('An Azure Blob disk requires a `connectionString` or `accountName` + `accountKey`.')
    })
    return await this.containerPromise
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
