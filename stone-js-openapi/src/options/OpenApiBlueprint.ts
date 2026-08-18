import { AppConfig, BlueprintContext, IBlueprint, NextMiddleware, StoneBlueprint, type MetaMiddleware } from '@stone-js/core'
import { DEFAULT_DOCS_PATH, DEFAULT_SPEC_PATH, OpenApiHandler, OpenApiServeOptions } from '../OpenApiHandler'

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
 * Registers the two contract routes, with their paths taken from configuration.
 *
 * A blueprint middleware rather than static definitions, because the paths are configurable and the
 * blueprint constant is evaluated before the application has said anything. Both routes are added
 * to `stone.router.definitions`, the same array the router scans, so nothing here depends on the
 * router package itself.
 *
 * @param context - The blueprint context.
 * @param next - The next blueprint middleware.
 * @returns The blueprint.
 */
export const OpenApiBlueprintMiddleware = async (
  context: BlueprintContext<IBlueprint>,
  next: NextMiddleware<BlueprintContext<IBlueprint>, IBlueprint>
): Promise<IBlueprint> => {
  const blueprint = await next(context)
  const options = blueprint.get<OpenApiConfig>('stone.openapi', {})
  const specPath = options.specPath ?? DEFAULT_SPEC_PATH
  const docsPath = options.docsPath ?? DEFAULT_DOCS_PATH

  blueprint.add('stone.router.definitions', [
    {
      path: specPath,
      method: 'GET',
      name: 'openapi.spec',
      handler: { module: OpenApiHandler, action: 'spec', isClass: true }
    }
  ])

  // `docsPath: false` serves the machine-readable contract only, which is what you want when the
  // explorer is hosted elsewhere or must not be public.
  if (docsPath !== false) {
    blueprint.add('stone.router.definitions', [
      {
        path: docsPath,
        method: 'GET',
        name: 'openapi.docs',
        handler: { module: OpenApiHandler, action: 'docs', isClass: true }
      }
    ])
  }

  return blueprint
}

/**
 * Meta blueprint middleware for the OpenAPI module.
 */
export const metaOpenApiBlueprintMiddleware: MetaMiddleware<BlueprintContext<IBlueprint>, IBlueprint> = {
  module: OpenApiBlueprintMiddleware,
  priority: 5
}

/**
 * Opt-in blueprint: import and register it to serve the contract and its explorer.
 *
 * ```ts
 * blueprint.set(openApiBlueprint).set('stone.openapi.info', { title: 'Tasks', version: '1.0.0' })
 * ```
 *
 * Two routes appear, `/openapi.json` and `/docs`, both configurable under `stone.openapi`. The
 * server URL advertised by the document is the host that answered the request, not a value frozen
 * at build time, so the same artefact documents itself correctly behind a local port, a load
 * balancer or an API Gateway stage.
 */
export const openApiBlueprint: OpenApiBlueprint = {
  stone: {
    openapi: {},
    blueprint: {
      middleware: [metaOpenApiBlueprintMiddleware]
    }
  }
}
