import type { FileSystem } from './FileSystem'

/**
 * Options for a temporary (signed) download URL.
 */
export interface TemporaryUrlOptions {
  /** Seconds until the URL expires (driver default applies when omitted). */
  expiresIn?: number
  /** Force a `Content-Type` on the response (e.g. inline preview vs download). */
  responseContentType?: string
  /** Force a `Content-Disposition` on the response (e.g. `attachment; filename="x"`). */
  responseContentDisposition?: string
}

/**
 * A signed upload target: the URL to `PUT` to, the method, and any headers the client must send
 * for the signature to match (e.g. `Content-Type`).
 */
export interface SignedUpload {
  /** The signed URL to upload to. */
  url: string
  /** The HTTP method to use (usually `PUT`). */
  method: string
  /** Headers the client MUST send so the signature validates. */
  headers: Record<string, string>
  /** Seconds until the URL expires. */
  expiresIn: number
}

/**
 * Options for a temporary (signed) upload URL.
 */
export interface TemporaryUploadUrlOptions {
  /** Seconds until the URL expires (driver default applies when omitted). */
  expiresIn?: number
  /** The `Content-Type` the client will upload with (bound into the signature when set). */
  contentType?: string
  /** The exact `Content-Length` to bind into the signature, if the driver supports it. */
  contentLength?: number
}

/**
 * Optional capability implemented by drivers that can mint short-lived signed URLs (object stores:
 * S3/R2/OSS/COS, GCS, Azure Blob). It lets a client upload straight to storage and download private
 * objects without proxying bytes through the app. Local/agnostic code should feature-detect with
 * {@link supportsSignedUrls} rather than assume a driver implements it.
 */
export interface SignedUrlCapable {
  /**
   * Mint a short-lived signed URL to **download** `path`.
   *
   * @param path - The object path (relative to the disk root/bucket).
   * @param options - Expiry and response-header overrides.
   * @returns The signed download URL.
   */
  temporaryUrl: (path: string, options?: TemporaryUrlOptions) => Promise<string>

  /**
   * Mint a short-lived signed target to **upload** to `path` (direct-to-storage).
   *
   * @param path - The destination object path (relative to the disk root/bucket).
   * @param options - Expiry and the content type/length to bind into the signature.
   * @returns The signed upload target (url, method, required headers, expiry).
   */
  temporaryUploadUrl: (path: string, options?: TemporaryUploadUrlOptions) => Promise<SignedUpload>
}

/**
 * Whether a {@link FileSystem} driver also implements {@link SignedUrlCapable}.
 *
 * @param driver - The storage driver.
 * @returns True when the driver can mint signed URLs.
 */
export function supportsSignedUrls (driver: FileSystem): driver is FileSystem & SignedUrlCapable {
  return typeof (driver as Partial<SignedUrlCapable>).temporaryUrl === 'function' &&
    typeof (driver as Partial<SignedUrlCapable>).temporaryUploadUrl === 'function'
}
