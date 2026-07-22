import {
  sep,
  join,
  resolve,
  dirname,
  extname,
  basename,
  isAbsolute
} from 'node:path'
import {
  rmSync,
  statSync,
  lstatSync,
  chmodSync,
  constants,
  mkdirSync,
  existsSync,
  accessSync,
  renameSync,
  copyFileSync,
  readFileSync,
  writeFileSync
} from 'node:fs'
import mime from 'mime'
import { filesize } from 'filesize'
import { createHash } from 'node:crypto'
import { FilesystemError } from '../errors/FilesystemError'

/**
 * Class representing a File.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
/** A filesystem stat timestamp in milliseconds (number, or bigint under bigint stat mode). */
export type StatTimeMs = number | bigint | undefined

export class File {
  private readonly path: string
  private stats?: ReturnType<typeof statSync>

  /**
   * Create a File.
   *
   * @param path - The file path.
   * @param checkPath - Whether to check if the file path is valid.
   * @returns A new File instance.
   */
  static create (path: string, checkPath: boolean = true): File {
    return new this(path, checkPath)
  }

  /**
   * Create a File.
   *
   * @param path - The file path.
   * @param checkPath - Whether to check if the file path is valid.
   */
  protected constructor (path: string, checkPath: boolean = true) {
    this.path = path
    if (checkPath) {
      this.validateFile()
    }
  }

  /**
   * Get file content.
   *
   * @returns The content of the file as a string.
   */
  getContent (encoding: BufferEncoding = 'utf-8'): string {
    return this.getBuffer().toString(encoding)
  }

  /**
   * Get the raw file content as a Buffer (binary-safe).
   *
   * @returns The content of the file as a Buffer.
   * @throws FilesystemError if the file cannot be read.
   */
  getBuffer (): Buffer {
    try {
      return readFileSync(this.path)
    } catch (error: any) {
      throw new FilesystemError(`Could not get the content of the file (${this.path}).`, { cause: error })
    }
  }

  /**
   * Write content to file (creating it if it does not exist).
   *
   * @param content - The content to write to the file.
   * @returns The current File instance.
   * @throws FilesystemError if the content cannot be written.
   */
  write (content: string | Buffer): this {
    try {
      writeFileSync(this.path, content)
    } catch (error: any) {
      throw new FilesystemError(`Could not write content to this file (${this.path}).`, { cause: error })
    }
    this.invalidateStats()
    return this
  }

  /**
   * Edit file content.
   *
   * @param callback - The callback function to modify the file content.
   * @returns The current File instance.
   */
  edit (callback: (content: string) => string): this {
    return this.write(callback(this.getContent()))
  }

  /**
   * Move file to a new directory.
   *
   * @param directory - The target directory.
   * @param name - The new name for the file.
   * @returns The new File instance representing the moved file.
   * @throws FileError if the file could not be moved.
   */
  move (directory: string, name?: string): File {
    const target = this.getTargetFile(directory, name)

    try {
      renameSync(this.getPath(), target.getPath())
    } catch (error: any) {
      // `rename` fails with EXDEV across devices/mounts (e.g. tmpdir → a different volume, common
      // in containers): fall back to copy + delete.
      if (error?.code === 'EXDEV') {
        try {
          copyFileSync(this.getPath(), target.getPath())
          rmSync(this.getPath(), { force: true })
        } catch (copyError: any) {
          throw new FilesystemError(`Could not move the file "${this.getPath()}" to "${target.getPath()}" (${String(copyError.message)}).`, { cause: copyError })
        }
      } else {
        throw new FilesystemError(`Could not move the file "${this.getPath()}" to "${target.getPath()}" (${String(error.message)}).`, { cause: error })
      }
    }

    // Honour the process umask instead of forcing world-writable 0o666 (which would make an
    // uploaded file readable/writable by every user on the host).
    try { chmodSync(target.getPath(), 0o666 & ~process.umask()) } catch { /* best-effort */ }

    this.invalidateStats()
    return target
  }

  /**
   * Remove file.
   *
   * @param force - Whether to forcefully remove the file.
   * @returns The current File instance.
   */
  remove (force: boolean = false): this {
    try {
      rmSync(this.path, { force })
    } catch (error: any) {
      throw new FilesystemError(`Could not remove this file (${this.path}) (${String(error.message)}).`, { cause: error })
    }
    this.invalidateStats()
    return this
  }

  /**
   * Get the hashed content of the file.
   *
   * @param algo - The hashing algorithm to use.
   * @returns The hashed content of the file as a hex string.
   */
  getHashedContent (algo: string = 'sha256'): string {
    // Hash the raw bytes (binary-safe); hashing a utf-8 decode would corrupt non-text files.
    return createHash(algo).update(this.getBuffer()).digest('hex')
  }

  /**
   * Get file size.
   *
   * @param formatted - Whether to return the file size as a formatted string.
   * @returns The file size as a string or number.
   */
  getSize (formatted: boolean = false): string | StatTimeMs {
    const size = this.getStats()?.size
    return size !== undefined && formatted ? filesize(Number(size)) : size
  }

  /**
   * Get the MIME type of the file.
   *
   * @returns The MIME type of the file.
   */
  getMimeType (): string | undefined

  /**
   * Get the MIME type of the file.
   *
   * @param fallback - A fallback MIME type if detection fails.
   * @returns The MIME type of the file.
   */
  getMimeType (fallback: string): string

  /**
   * Get the MIME type of the file.
   *
   * @param fallback - A fallback MIME type if detection fails.
   * @returns The MIME type of the file.
   */
  getMimeType (fallback?: string): string | undefined {
    return mime.getType(this.path) ?? fallback
  }

  /**
   * Get the directory name of the file.
   *
   * @returns The directory name.
   */
  getDirname (): string {
    return dirname(this.path)
  }

  /**
   * Get the file path.
   *
   * @returns The file path.
   */
  getPath (): string {
    return this.path
  }

  /**
   * Get the encoded file path.
   *
   * @returns The encoded file path.
   */
  getEncodedPath (): string {
    return encodeURI(this.getPath())
  }

  /**
 * Get the absolute file path.
 *
 * @param root - The root directory to resolve from.
 * @returns The absolute file path.
 */
  getAbsolutePath (root: string = ''): string {
    return resolve(root, this.path)
  }

  /**
   * Get the encoded absolute file path.
   *
   * @param root - The root directory to resolve from.
   * @returns The encoded absolute file path.
   */
  getEncodedAbsolutePath (root: string = ''): string {
    return encodeURI(this.getAbsolutePath(root))
  }

  /**
   * Get the basename of the file.
   *
   * @param exclude - The file extension to exclude from the basename.
   * @returns The basename of the file.
   */
  getBasename (exclude: string = ''): string {
    return basename(this.path, exclude)
  }

  /**
   * Get the filename of the file.
   *
   * @returns The filename of the file.
   */
  getFilename (): string {
    return this.getBasename()
  }

  /**
   * Get the name of the file without extension.
   *
   * @returns The name of the file.
   */
  getName (): string {
    return this.getBasename(this.getExtension())
  }

  /**
   * Get the file extension.
   *
   * @returns The file extension.
   */
  getExtension (): string {
    return extname(this.path)
  }

  /**
   * Get the last access time of the file.
   *
   * @returns The last access time in milliseconds.
   */
  getATime (): StatTimeMs {
    return this.getStats()?.atimeMs
  }

  /**
   * Get the last modified time of the file.
   *
   * @returns The last modified time in milliseconds.
   */
  getMTime (): StatTimeMs {
    return this.getStats()?.mtimeMs
  }

  /**
   * Get the created time of the file.
   *
   * @returns The created time in milliseconds.
   */
  getCTime (): StatTimeMs {
    return this.getStats()?.ctimeMs
  }

  /**
   * Check if the file exists.
   *
   * @returns True if the file exists, otherwise false.
   */
  exists (): boolean {
    return existsSync(this.path)
  }

  /**
   * Check if the file path starts with a provided prefix.
   *
   * @returns True if the file path starts with the provided prefix, otherwise false.
   */
  isPathPrefix (prefix: string): boolean {
    const fullPath = resolve(this.path)
    const prefixPath = resolve(prefix)
    // Require a real path boundary so `/tmp/foo-evil` does NOT match the prefix `/tmp/foo`.
    // Case-sensitive (matches POSIX filesystems and avoids a false sense of confinement).
    return fullPath === prefixPath || fullPath.startsWith(prefixPath.endsWith(sep) ? prefixPath : prefixPath + sep)
  }

  /**
   * Check if the file is compressed.
   *
   * @returns True if the file is compressed, otherwise false.
   */
  isCompressed (extensions: string[] = ['.br', '.brotli', '.gz', '.gzip']): boolean {
    return extensions.includes(this.getExtension())
  }

  /**
   * Check if the file is a directory.
   *
   * @returns True if the file is a directory, otherwise false.
   */
  isDir (): boolean {
    return this.getStats()?.isDirectory?.() ?? false
  }

  /**
   * Check if the file is a regular file.
   *
   * @returns True if the file is a regular file, otherwise false.
   */
  isFile (): boolean {
    return this.getStats()?.isFile?.() ?? false
  }

  /**
   * Check if the file is a symbolic link.
   *
   * @returns True if the file is a symbolic link, otherwise false.
   */
  isLink (): boolean {
    // `lstat` does NOT follow symlinks (unlike `stat`), so a symlink is actually detected.
    try {
      return lstatSync(this.path).isSymbolicLink()
    } catch {
      return false
    }
  }

  /**
   * Check if the file path is absolute.
   *
   * @returns True if the file path is absolute, otherwise false.
   */
  isAbsolute (): boolean {
    return isAbsolute(this.path)
  }

  /**
   * Check if the file is writable.
   *
   * @returns True if the file is writable, otherwise false.
   */
  isWritable (): boolean {
    try {
      accessSync(this.path, constants.W_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if the file is readable.
   *
   * @returns True if the file is readable, otherwise false.
   */
  isReadable (): boolean {
    try {
      accessSync(this.path, constants.R_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if the file is executable.
   *
   * @returns True if the file is executable, otherwise false.
   */
  isExecutable (): boolean {
    try {
      accessSync(this.path, constants.X_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get the file statistics.
   *
   * @returns The file statistics object.
   */
  private getStats (): ReturnType<typeof statSync> | undefined {
    if (this.stats === undefined) {
      // Never throw a raw ENOENT: a missing file makes the predicates (isFile/isDir/...) return
      // false rather than crash.
      try {
        this.stats = statSync(this.path)
      } catch {
        return undefined
      }
    }
    return this.stats
  }

  /**
   * Invalidate the cached stats after a mutation (write/move/remove) so size/mtime/predicates
   * reflect the new state on the next read.
   */
  private invalidateStats (): void {
    this.stats = undefined
  }

  /**
   * Validate if the file exists.
   *
   * @throws FileError if the file does not exist.
   */
  private validateFile (): void {
    if (!this.exists()) {
      throw new FilesystemError(`File not found. (${this.path})`)
    }
  }

  /**
   * Get the target file instance for moving or copying operations.
   *
   * @param directory - The target directory.
   * @param name - The new name for the file.
   * @returns A new File instance representing the target file.
   * @throws FileError if the directory cannot be created or is not writable.
   */
  private getTargetFile (directory: string, name: string | null = null): File {
    if (!existsSync(directory)) {
      try {
        mkdirSync(directory, { recursive: true })
      } catch {
        throw new FilesystemError(`Unable to create the "${directory}" directory.`)
      }
    } else {
      try {
        accessSync(directory, constants.W_OK)
      } catch {
        throw new FilesystemError(`Unable to write in the "${directory}" directory.`)
      }
    }

    // Sanitize the target name with `basename` so a caller-supplied name like `../../evil`
    // cannot escape the target directory (path traversal).
    const safeName = name !== null && name !== undefined ? basename(name) : this.getFilename()
    return new File(join(directory, safeName), false)
  }
}
