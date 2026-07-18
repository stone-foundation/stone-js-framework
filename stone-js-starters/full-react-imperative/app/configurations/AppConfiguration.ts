import { getString } from '@stone-js/env'
import { NODE_HTTP_PLATFORM } from '@stone-js/node-http-adapter'
import { defineConfig, IBlueprint, Promiseable } from '@stone-js/core'

/**
 * App Configuration
 */
export const AppConfig = defineConfig({
  configure (blueprint: IBlueprint): Promiseable<void> {
    blueprint
      .set('stone.kernel.skipMiddleware', false)
      .set('app.api.baseURL', getString('API_BASE_URL', 'http://localhost:8080'))
  },
  afterConfigure (blueprint: IBlueprint): Promiseable<void> {
    if (blueprint.is('stone.adapter.platform', NODE_HTTP_PLATFORM)) {
      blueprint.set('stone.adapter.url', 'http://localhost:3100')
    }
  }
})
