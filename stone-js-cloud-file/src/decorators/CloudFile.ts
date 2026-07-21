import { cloneValue } from '@stone-js/config'
import { DiskConfig } from '../declarations'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { cloudFileBlueprint } from '../options/CloudFileBlueprint'

/**
 * Options for the `@CloudFile` decorator: a single disk's configuration (the `driver` is required).
 */
export interface CloudFileOptions extends Partial<DiskConfig> {
  driver: DiskConfig['driver']
}

/**
 * Class decorator: enable cloud storage with a single disk, declaratively.
 *
 * `@CloudFile({ driver: 's3', bucket, region })` registers the {@link CloudFileServiceProvider} and
 * sets that disk as the default. For multiple disks or richer setups, configure `stone.filesystem`
 * via `@Configuration()` (or the imperative `cloudFileBlueprint`) instead.
 *
 * @param options - The disk configuration (driver required).
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { CloudFile } from '@stone-js/cloud-file'
 *
 * @CloudFile({ driver: 's3', bucket: 'uploads', region: 'eu-west-3' })
 * @StoneApp({ name: 'app' })
 * export class Application {}
 * ```
 */
export const CloudFile = <T extends ClassType = ClassType>(options: CloudFileOptions): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(cloudFileBlueprint)
    const name = options.name ?? String(options.driver)

    blueprint.stone.filesystem.default = name
    blueprint.stone.filesystem.disks = [{ ...options, name }]

    addBlueprint(target, context, blueprint)
  })
}
