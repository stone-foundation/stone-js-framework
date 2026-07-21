import { CloudFileConfig } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { CloudFileServiceProvider } from '../CloudFileServiceProvider'

/**
 * The `stone.filesystem` configuration bucket.
 */
export interface FilesystemConfig extends CloudFileConfig {}

/**
 * Application config augmented with the filesystem bucket.
 */
export interface CloudFileAppConfig extends Partial<AppConfig> {
  filesystem: FilesystemConfig
}

/**
 * Blueprint for the cloud-file module.
 */
export interface CloudFileBlueprint extends StoneBlueprint {
  stone: CloudFileAppConfig
}

/**
 * Opt-in blueprint: import and register it to enable cloud storage.
 *
 * It contributes the {@link CloudFileServiceProvider}, which binds `storage` (the multi-disk
 * manager) and `fileSystem` (the default disk) into the container. Configure disks under
 * `stone.filesystem` (or use the `@CloudFile()` decorator for a single disk). `stone.providers` is
 * an array, so this merges with the rest of the app.
 */
export const cloudFileBlueprint: CloudFileBlueprint = {
  stone: {
    filesystem: {},
    providers: [
      CloudFileServiceProvider
    ]
  }
}
