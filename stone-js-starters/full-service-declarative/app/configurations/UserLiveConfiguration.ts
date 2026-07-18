import { Configuration, IBlueprint, IConfiguration } from '@stone-js/core'

/**
 * User Live Configuration
 * Usefull for loading configuration without restarting the application.
 * Live explicit configuration takes precedence over explicit and implicit configurations.
 * Note: Only applicable for server applications.
 */
@Configuration({ live: true })
export class UserLiveConfiguration implements IConfiguration {
  /**
   * Configure the application
   *
   * @param blueprint - The blueprint to configure
   */
  async configure (blueprint: IBlueprint): Promise<void> {
    blueprint.set('stone.name', await this.fetchConfigurationRemotely())
    console.log('I am live cause i am loaded at each request...')
  }

  /**
   * Fetch the configuration remotely
   */
  async fetchConfigurationRemotely (): Promise<string> {
    console.log('Fetching configuration...')
    return await Promise.resolve('My Fetched app name')
  }
}
