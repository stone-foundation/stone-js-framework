import { IBlueprint } from '@stone-js/core'
import { deepMerge } from '@stone-js/config'
import { transformLeaves } from './utils'
import { ConfigSource, ConfigTransform } from './declarations'

/**
 * Options for the {@link ConfigSourceManager}.
 */
export interface ConfigSourceManagerOptions {
  /** A per-leaf value transform applied after merging (e.g. `kmsDecryptor()`). */
  transform?: ConfigTransform
  /** The blueprint key to nest the loaded config under (defaults to the root). */
  key?: string
}

/**
 * Loads and merges configuration sources, then writes the result into the blueprint.
 *
 * Sources are merged in order, later sources winning. `loadInto` is meant to run from a
 * `@Configuration()`'s async `configure(blueprint)`, which the framework awaits during
 * `initBlueprint`, before any blueprint middleware, so the whole app boots with the config already
 * in place. Mark the `@Configuration({ live: true })` to reload it on every incoming event.
 */
export class ConfigSourceManager {
  private readonly sources: ConfigSource[]
  private readonly options: ConfigSourceManagerOptions

  /**
   * Create a ConfigSourceManager.
   *
   * @param sources - The initial sources (merged in order).
   * @param options - The manager options.
   * @returns A new manager.
   */
  static create (sources: ConfigSource[] = [], options: ConfigSourceManagerOptions = {}): ConfigSourceManager {
    return new this(sources, options)
  }

  /**
   * @param sources - The initial sources (merged in order).
   * @param options - The manager options.
   */
  constructor (sources: ConfigSource[] = [], options: ConfigSourceManagerOptions = {}) {
    this.sources = [...sources]
    this.options = options
  }

  /**
   * Add a source (lowest precedence first, highest last).
   *
   * @param source - The source to append.
   * @returns This manager for chaining.
   */
  add (source: ConfigSource): this {
    this.sources.push(source)
    return this
  }

  /**
   * Load and merge every source, applying the transform to the merged result.
   *
   * @returns The merged configuration.
   */
  async load (): Promise<Record<string, unknown>> {
    let merged: Record<string, unknown> = {}
    for (const source of this.sources) {
      merged = deepMerge(merged, await source.load())
    }
    if (this.options.transform !== undefined) {
      merged = await transformLeaves(merged, this.options.transform) as Record<string, unknown>
    }
    return merged
  }

  /**
   * Load the merged configuration into the blueprint.
   *
   * @param blueprint - The application blueprint.
   */
  async loadInto (blueprint: IBlueprint): Promise<void> {
    const config = await this.load()
    if (this.options.key !== undefined) {
      blueprint.set(this.options.key, config)
    } else {
      blueprint.set(config)
    }
  }
}

/**
 * Convenience: load and merge sources straight into the blueprint.
 *
 * @param blueprint - The application blueprint.
 * @param sources - The sources (merged in order).
 * @param options - The manager options.
 *
 * @example
 * ```typescript
 * @Configuration()
 * export class AppConfig {
 *   async configure (blueprint) {
 *     await loadConfigSources(blueprint, [envSource(), fileSource({ path: './config.yaml' })])
 *   }
 * }
 * ```
 */
export async function loadConfigSources (
  blueprint: IBlueprint,
  sources: ConfigSource[],
  options: ConfigSourceManagerOptions = {}
): Promise<void> {
  await ConfigSourceManager.create(sources, options).loadInto(blueprint)
}
