import { existsSync } from 'fs'
import { RollupOptions } from 'rollup'
import { IBlueprint } from '@stone-js/core'
import { RollupConfig } from '../options/BuilderConfig'
import { basePath, importModule } from '@stone-js/filesystem'

/**
 * Gets the Rollup configuration.
 *
 * @returns The Rollup configuration.
 */
export const getRollupConfig = async (
  blueprint: IBlueprint,
  command: 'build' | 'bundle' = 'build'
): Promise<RollupOptions> => {
  const filename = 'rollup.config'
  const config = blueprint.get<RollupConfig>('stone.builder.rollup', {} as any)
  let module: Record<'rollupBuildConfig' | 'rollupBundleConfig', RollupOptions> | undefined

  if (existsSync(basePath(`${filename}.mjs`))) {
    module = await importModule(`${filename}.mjs`)
  } else if (existsSync(basePath(`${filename}.js`))) {
    module = await importModule(`${filename}.js`)
  }

  // Full override if the rollup config file exists.
  config.build = module?.rollupBuildConfig ?? config.build
  config.bundle = module?.rollupBundleConfig ?? config.bundle

  return config[command]
}
