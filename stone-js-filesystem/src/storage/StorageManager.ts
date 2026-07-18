import { FileSystem } from './FileSystem'
import { LocalFileSystem } from './LocalFileSystem'
import { FilesystemError } from '../errors/FilesystemError'

/**
 * A factory that lazily builds a {@link FileSystem} driver (so a disk is only constructed when
 * first used — e.g. an S3 client is not created until the `s3` disk is accessed).
 */
export type FileSystemFactory = () => FileSystem

/**
 * Multi-disk storage registry.
 *
 * Application code resolves a disk by name (`storage.disk('s3')`) and talks to it through the
 * agnostic {@link FileSystem} contract, so the concrete backend is a registration/configuration
 * detail. A `local` disk rooted at the current working directory is registered by default; an
 * `S3FileSystem` (or any other driver) is added with {@link registerFactory} without touching
 * consumers.
 *
 * ```ts
 * const storage = StorageManager.create()
 * storage.registerFactory('s3', () => S3FileSystem.create({ bucket, region }))
 * await storage.disk('s3').put('avatars/1.png', bytes)
 * ```
 */
export class StorageManager {
  private defaultDisk: string
  private readonly disks = new Map<string, FileSystem>()
  private readonly factories = new Map<string, FileSystemFactory>()

  /**
   * Create a StorageManager.
   *
   * @param defaultDisk - The name of the default disk.
   * @returns A new StorageManager with a `local` disk registered.
   */
  static create (defaultDisk: string = 'local'): StorageManager {
    return new this(defaultDisk)
  }

  /**
   * Create a StorageManager.
   *
   * @param defaultDisk - The name of the default disk.
   */
  constructor (defaultDisk: string = 'local') {
    this.defaultDisk = defaultDisk
    this.registerFactory('local', () => LocalFileSystem.create())
  }

  /**
   * Register a ready-made disk driver instance.
   *
   * @param name - The disk name.
   * @param driver - The driver instance.
   * @returns This manager for chaining.
   */
  register (name: string, driver: FileSystem): this {
    this.disks.set(name, driver)
    return this
  }

  /**
   * Register a lazy factory for a disk (the driver is built on first access).
   *
   * @param name - The disk name.
   * @param factory - The driver factory.
   * @returns This manager for chaining.
   */
  registerFactory (name: string, factory: FileSystemFactory): this {
    this.factories.set(name, factory)
    return this
  }

  /**
   * Set the default disk name.
   *
   * @param name - The disk name.
   * @returns This manager for chaining.
   */
  setDefaultDisk (name: string): this {
    this.defaultDisk = name
    return this
  }

  /**
   * Resolve a disk by name (defaults to the default disk).
   *
   * @param name - The disk name.
   * @returns The resolved {@link FileSystem} driver.
   * @throws FilesystemError if no disk/factory is registered under the name.
   */
  disk (name?: string): FileSystem {
    const diskName = name ?? this.defaultDisk

    const existing = this.disks.get(diskName)
    if (existing !== undefined) { return existing }

    const factory = this.factories.get(diskName)
    if (factory === undefined) {
      throw new FilesystemError(`No storage disk registered under "${diskName}".`)
    }

    const driver = factory()
    this.disks.set(diskName, driver)
    return driver
  }

  /**
   * Whether a disk (instance or factory) is registered under the name.
   *
   * @param name - The disk name.
   * @returns True if the disk is registered.
   */
  has (name: string): boolean {
    return this.disks.has(name) || this.factories.has(name)
  }
}
