import mime from 'mime'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { pathToFileURL } from 'node:url'
import { createReadStream, createWriteStream } from 'node:fs'
import { sep, join, resolve, dirname, relative, isAbsolute } from 'node:path'
import { stat, readFile, writeFile, rm, copyFile, rename, mkdir, readdir } from 'node:fs/promises'
import { FilesystemError } from '../errors/FilesystemError'
import { FileSystem, FileSystemOptions, StorageStat } from './FileSystem'

/**
 * Local-disk implementation of the agnostic {@link FileSystem} contract.
 *
 * All operations are async (non-blocking) and CONFINED to the configured root directory: any path
 * that resolves outside the root is rejected, so a caller-supplied path such as `../../etc/passwd`
 * can never escape the disk. This mirrors how an object store confines access to a bucket, which is
 * exactly what makes a future `S3FileSystem` a drop-in for the same interface.
 */
export class LocalFileSystem implements FileSystem {
  readonly name: string
  private readonly root: string
  private readonly baseUrl?: string

  /**
   * Create a LocalFileSystem.
   *
   * @param options - The disk options (root defaults to the current working directory).
   * @returns A new LocalFileSystem.
   */
  static create (options: FileSystemOptions = {}): LocalFileSystem {
    return new this(options)
  }

  /**
   * Create a LocalFileSystem.
   *
   * @param options - The disk options.
   */
  constructor (options: FileSystemOptions = {}) {
    this.name = options.name ?? 'local'
    this.root = resolve(options.root ?? process.cwd())
    this.baseUrl = options.baseUrl
  }

  /** @inheritdoc */
  async exists (path: string): Promise<boolean> {
    try {
      await stat(this.resolvePath(path))
      return true
    } catch {
      return false
    }
  }

  /** @inheritdoc */
  async get (path: string): Promise<Buffer> {
    try {
      return await readFile(this.resolvePath(path))
    } catch (error: any) {
      throw new FilesystemError(`Could not read "${path}".`, { cause: error })
    }
  }

  /** @inheritdoc */
  async getText (path: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return (await this.get(path)).toString(encoding)
  }

  /** @inheritdoc */
  async put (path: string, content: Buffer | string): Promise<void> {
    const target = this.resolvePath(path)
    await mkdir(dirname(target), { recursive: true })
    try {
      await writeFile(target, content)
    } catch (error: any) {
      throw new FilesystemError(`Could not write "${path}".`, { cause: error })
    }
  }

  /** @inheritdoc */
  async delete (path: string): Promise<boolean> {
    const target = this.resolvePath(path)
    if (!(await this.exists(path))) { return false }
    await rm(target, { recursive: true, force: true })
    return true
  }

  /** @inheritdoc */
  async copy (source: string, destination: string): Promise<void> {
    const to = this.resolvePath(destination)
    await mkdir(dirname(to), { recursive: true })
    try {
      await copyFile(this.resolvePath(source), to)
    } catch (error: any) {
      throw new FilesystemError(`Could not copy "${source}" to "${destination}".`, { cause: error })
    }
  }

  /** @inheritdoc */
  async move (source: string, destination: string): Promise<void> {
    const from = this.resolvePath(source)
    const to = this.resolvePath(destination)
    await mkdir(dirname(to), { recursive: true })
    try {
      await rename(from, to)
    } catch (error: any) {
      // Fall back to copy + delete across devices/mounts (EXDEV).
      if (error?.code === 'EXDEV') {
        await copyFile(from, to)
        await rm(from, { force: true })
      } else {
        throw new FilesystemError(`Could not move "${source}" to "${destination}".`, { cause: error })
      }
    }
  }

  /** @inheritdoc */
  async stat (path: string): Promise<StorageStat> {
    try {
      const stats = await stat(this.resolvePath(path))
      return {
        path,
        size: stats.size,
        lastModified: stats.mtimeMs,
        mimeType: mime.getType(path) ?? undefined,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      }
    } catch (error: any) {
      throw new FilesystemError(`Could not stat "${path}".`, { cause: error })
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
    return mime.getType(path) ?? undefined
  }

  /** @inheritdoc */
  async url (path: string): Promise<string> {
    if (this.baseUrl !== undefined) {
      return `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
    }
    return pathToFileURL(this.resolvePath(path)).href
  }

  /** @inheritdoc */
  async files (directory: string = '', recursive: boolean = false): Promise<string[]> {
    const base = this.resolvePath(directory)
    const entries = await readdir(base, { withFileTypes: true, recursive })
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => {
        // `parentPath` (Node 20.12+/22+) or the older `path`; the `base` fallback only matters on
        // Node versions lacking both and can't be exercised on a single runtime.
        /* v8 ignore next */
        const parent = (entry as any).parentPath ?? (entry as any).path ?? base
        return relative(this.root, join(parent, entry.name))
      })
  }

  /** @inheritdoc */
  async makeDirectory (path: string): Promise<void> {
    await mkdir(this.resolvePath(path), { recursive: true })
  }

  /** @inheritdoc */
  async readStream (path: string): Promise<Readable> {
    if (!(await this.exists(path))) {
      throw new FilesystemError(`Could not read "${path}": file not found.`)
    }
    return createReadStream(this.resolvePath(path))
  }

  /** @inheritdoc */
  async writeStream (path: string, stream: Readable): Promise<void> {
    const target = this.resolvePath(path)
    await mkdir(dirname(target), { recursive: true })
    await pipeline(stream, createWriteStream(target))
  }

  /**
   * Resolve a disk-relative path to an absolute path, confined to the root.
   *
   * @param path - The disk-relative path.
   * @returns The confined absolute path.
   * @throws FilesystemError if the path escapes the root (traversal attempt).
   */
  private resolvePath (path: string): string {
    const resolved = isAbsolute(path) ? resolve(path) : resolve(this.root, path)
    if (resolved !== this.root && !resolved.startsWith(this.root + sep)) {
      throw new FilesystemError(`Path "${path}" escapes the storage root.`)
    }
    return resolved
  }
}
