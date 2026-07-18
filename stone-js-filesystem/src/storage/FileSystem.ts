import type { Readable } from 'node:stream'

/**
 * Agnostic storage-driver contract for Stone.js.
 *
 * This is the abstraction that makes the filesystem layer backend-independent: the local disk
 * ({@link LocalFileSystem}) implements it today, and a future `S3FileSystem` (or GCS, Azure Blob,
 * R2, in-memory…) implements the exact same interface. Application/domain code depends only on
 * `FileSystem`, never on `node:fs`, so switching or mixing backends is a configuration concern
 * (see {@link StorageManager}), not a code change.
 *
 * Every operation is **async** — object stores are inherently network-bound, and even the local
 * driver uses non-blocking I/O so a file operation never stalls the event loop. Paths are always
 * relative to the driver's root (its "disk"/"bucket"); a driver MUST confine access to that root.
 */
export interface FileSystem {
  /** A human-readable disk name (e.g. `'local'`, `'s3'`), used by the {@link StorageManager}. */
  readonly name: string

  /** Whether a file (or object) exists at `path`. */
  exists: (path: string) => Promise<boolean>

  /** Read the raw bytes at `path`. */
  get: (path: string) => Promise<Buffer>

  /** Read the content at `path` decoded as text. */
  getText: (path: string, encoding?: BufferEncoding) => Promise<string>

  /** Write `content` to `path`, creating parent directories/prefixes as needed (overwrites). */
  put: (path: string, content: Buffer | string) => Promise<void>

  /** Delete `path`. Resolves to whether something was actually deleted. */
  delete: (path: string) => Promise<boolean>

  /** Copy `source` to `destination` within the disk. */
  copy: (source: string, destination: string) => Promise<void>

  /** Move/rename `source` to `destination` within the disk. */
  move: (source: string, destination: string) => Promise<void>

  /** Full metadata for `path`. */
  stat: (path: string) => Promise<StorageStat>

  /** The size in bytes of `path`. */
  size: (path: string) => Promise<number>

  /** The last-modified time (epoch ms) of `path`, if known. */
  lastModified: (path: string) => Promise<number | undefined>

  /** The best-effort MIME type of `path`, if known. */
  mimeType: (path: string) => Promise<string | undefined>

  /** A URL for `path` (a `file://` URL locally; a public/presigned URL for object stores). */
  url: (path: string) => Promise<string>

  /** List the file paths under `directory` (relative to the root), optionally recursively. */
  files: (directory?: string, recursive?: boolean) => Promise<string[]>

  /** Ensure a directory/prefix exists. */
  makeDirectory: (path: string) => Promise<void>

  /** Open a readable stream for `path` (streaming large objects without buffering). */
  readStream: (path: string) => Promise<Readable>

  /** Write a readable stream to `path`. */
  writeStream: (path: string, stream: Readable) => Promise<void>
}

/**
 * Backend-agnostic metadata for a stored file/object.
 */
export interface StorageStat {
  /** The path (relative to the disk root). */
  path: string
  /** Size in bytes. */
  size: number
  /** Last-modified time in epoch milliseconds, if known. */
  lastModified?: number
  /** Best-effort MIME type, if known. */
  mimeType?: string
  /** Whether this entry is a regular file/object. */
  isFile: boolean
  /** Whether this entry is a directory/prefix. */
  isDirectory: boolean
}

/**
 * Options shared by storage drivers.
 */
export interface FileSystemOptions {
  /** The disk name. */
  name?: string
  /** The root directory (local) or bucket/prefix (object store) all paths are resolved against. */
  root?: string
  /** An optional base URL used by {@link FileSystem.url} for public assets. */
  baseUrl?: string
}
