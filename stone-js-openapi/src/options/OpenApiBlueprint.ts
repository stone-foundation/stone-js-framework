import { OpenApiServeOptions } from '../OpenApiHandler'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { MetaOpenApiRoutesMiddleware } from '../middleware/OpenApiRoutesMiddleware'

/**
 * OpenAPI configuration bucket (`stone.openapi`).
 */
export interface OpenApiConfig extends OpenApiServeOptions {}

/**
 * Application config augmented with the OpenAPI bucket.
 */
export interface OpenApiAppConfig extends Partial<AppConfig> {
  openapi: OpenApiConfig
}

/**
 * Blueprint for the OpenAPI module.
 */
export interface OpenApiBlueprint extends StoneBlueprint {
  stone: OpenApiAppConfig
}

/**
 * Opt-in blueprint: register it to serve the contract and its explorer.
 *
 * The imperative half of the pair; `@OpenApi()` is the declarative one. Two routes appear,
 * `/openapi.json` and `/docs`, both configurable under `stone.openapi`. The server URL advertised by
 * the document is the host that answered the request, not a value frozen at build time, so the same
 * artefact documents itself correctly behind a local port, a load balancer or an API Gateway stage.
 *
 * @example
 * ```typescript
 * import { openApiBlueprint } from '@stone-js/openapi'
 *
 * export const Application = defineStoneApp(handler, { name: 'my-app' }, [openApiBlueprint])
 *
 * export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.openapi', {
 *   info: { title: 'Tasks', version: '1.0.0' }
 * }))
 * ```
 */
export const openApiBlueprint: OpenApiBlueprint = {
  stone: {
    openapi: {},
    blueprint: {
      middleware: [MetaOpenApiRoutesMiddleware]
    }
  }
}
