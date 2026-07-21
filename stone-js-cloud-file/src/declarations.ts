import type { FileSystem, FileSystemOptions } from '@stone-js/filesystem'

/**
 * Built-in driver identifiers. `local` is provided by `@stone-js/filesystem`; `s3` (and every
 * S3-compatible store: Cloudflare R2, MinIO, DigitalOcean Spaces, Alibaba OSS, Tencent COS) by this
 * module. `gcs` and `azure` follow.
 */
export type CloudFileDriver = 'local' | 's3' | 'gcs' | 'azure'

/**
 * A factory that builds a {@link FileSystem} driver from disk options. Registered per driver name;
 * unknown drivers can be added by the app without changing this module.
 */
export type CloudFileDriverFactory = (config: DiskConfig) => FileSystem

/**
 * Options common to every disk, plus the driver selector. Driver-specific options live alongside
 * (e.g. `bucket`/`region` for S3); the driver reads what it needs.
 */
export interface DiskConfig extends FileSystemOptions {
  /** The disk name, used to resolve it via `storage.disk(name)`. */
  name: string
  /** Which driver backs this disk. */
  driver: CloudFileDriver | string
  /** Driver-specific options (see {@link S3DriverOptions}). */
  [key: string]: unknown
}

/**
 * Options for the S3 (and S3-compatible) driver.
 */
export interface S3DriverOptions extends FileSystemOptions {
  /** The bucket name. */
  bucket: string
  /** The region (required by AWS; optional for some S3-compatible stores). */
  region?: string
  /** A custom endpoint for S3-compatible stores (R2, MinIO, OSS, COS). */
  endpoint?: string
  /** Use path-style addressing (`endpoint/bucket/key`), required by MinIO and some stores. */
  forcePathStyle?: boolean
  /** Static credentials; omit to use the provider's default credential chain (env, role, etc.). */
  credentials?: {
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
  }
  /** Default expiry (seconds) for signed URLs. Defaults to 900 (15 min). */
  signedUrlExpiresIn?: number
}

/**
 * Options for the Google Cloud Storage driver.
 */
export interface GcsDriverOptions extends FileSystemOptions {
  /** The bucket name. */
  bucket: string
  /** The GCP project id (optional when inferred from credentials/environment). */
  projectId?: string
  /** Path to a service-account key file. */
  keyFilename?: string
  /** Inline service-account credentials (alternative to `keyFilename`). */
  credentials?: { client_email: string, private_key: string }
  /** Default expiry (seconds) for signed URLs. Defaults to 900 (15 min). */
  signedUrlExpiresIn?: number
}

/**
 * Options for the Azure Blob Storage driver.
 */
export interface AzureBlobDriverOptions extends FileSystemOptions {
  /** The container name (used as the disk's "bucket"). */
  container: string
  /** A full connection string (alternative to account name + key). */
  connectionString?: string
  /** The storage account name (required for signed URLs when no connection string). */
  accountName?: string
  /** The storage account key (required for signed URLs). */
  accountKey?: string
  /** Default expiry (seconds) for signed URLs. Defaults to 900 (15 min). */
  signedUrlExpiresIn?: number
}

/**
 * The `stone.filesystem` configuration bucket.
 */
export interface CloudFileConfig {
  /** The default disk name (resolved by `storage.disk()` / injected as `fileSystem`). */
  default?: string
  /** The disks to register. */
  disks?: DiskConfig[]
}
