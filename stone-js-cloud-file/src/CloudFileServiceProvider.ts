import { StorageManager } from '@stone-js/filesystem'
import { S3FileSystem } from './drivers/S3FileSystem'
import { CloudFileError } from './errors/CloudFileError'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'
import { CloudFileConfig, DiskConfig, CloudFileDriverFactory } from './declarations'

/**
 * Built-in driver factories, keyed by driver name. `local` is provided by the StorageManager
 * itself; `gcs`/`azure` are added here as their drivers ship.
 */
const DRIVERS: Record<string, CloudFileDriverFactory> = {
  s3: (config) => S3FileSystem.create(config as any)
}

/**
 * Wires cloud storage into the container.
 *
 * From `stone.filesystem` it builds a {@link StorageManager}, registers a lazy factory per
 * configured disk (the driver, hence its SDK, is only constructed on first access), and binds the
 * manager as `storage` and the default disk as `fileSystem`, so a handler or service can inject
 * either: `constructor ({ fileSystem })` or `constructor ({ storage })`.
 */
export class CloudFileServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the storage services.
   */
  register (): Promiseable<void> {
    const config = this.container.make<IBlueprint>('blueprint').get<CloudFileConfig>('stone.filesystem', {})
    const storage = StorageManager.create(config.default ?? 'local')

    for (const disk of config.disks ?? []) {
      this.registerDisk(storage, disk)
    }

    this.container
      .instanceIf(StorageManager, storage)
      .alias(StorageManager, ['storage'])
      // The default disk, injectable as `fileSystem` (built lazily on first resolution).
      .singletonIf('fileSystem', () => storage.disk())
  }

  /**
   * Register one disk's lazy factory on the manager.
   *
   * @param storage - The storage manager.
   * @param disk - The disk configuration.
   * @throws {CloudFileError} When the disk names an unknown driver.
   */
  private registerDisk (storage: StorageManager, disk: DiskConfig): void {
    // `local` is registered by the StorageManager out of the box.
    if (disk.driver === 'local') { return }

    const factory = DRIVERS[disk.driver]
    if (factory === undefined) {
      throw new CloudFileError(`Unknown cloud-file driver "${String(disk.driver)}" for disk "${disk.name}".`)
    }

    storage.registerFactory(disk.name, () => factory(disk))
  }
}
