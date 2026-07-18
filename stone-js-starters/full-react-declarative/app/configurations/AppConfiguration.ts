import { getString } from '@stone-js/env'
import { Configuration, IBlueprint, IConfiguration, Promiseable } from '@stone-js/core'

/**
 * App Configuration
 */
@Configuration()
export class AppConfiguration implements IConfiguration {
  /**
   * Configure the application.
   */
  configure (blueprint: IBlueprint): Promiseable<void> {
    blueprint
      .set('stone.kernel.skipMiddleware', false)
      .set('app.api.baseURL', getString('API_BASE_URL', 'http://localhost:8080'))
  }
}
