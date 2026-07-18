import { defineConfig, IBlueprint } from '@stone-js/core'

/**
 * Configure the application
 *
 * @param blueprint - The blueprint to configure
 */
export async function liveConfig (blueprint: IBlueprint): Promise<void> {
  blueprint.set('stone.name', await fetchConfigurationRemotely())
  console.log('I am live cause i am loaded at each request...')
}

/**
 * Fetch the configuration remotely
 */
async function fetchConfigurationRemotely (): Promise<string> {
  console.log('Fetching configuration...')
  return await Promise.resolve('My Fetched app name')
}

/**
 * User Live Configuration
 */
export const UserLiveConfiguration = defineConfig((blueprint: IBlueprint): void => {
  blueprint.add('stone.liveConfigurations', [liveConfig])
})
