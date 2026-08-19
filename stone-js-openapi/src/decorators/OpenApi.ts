import { cloneValue } from '@stone-js/config'
import { OpenApiConfig, openApiBlueprint } from '../options/OpenApiBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@OpenApi` decorator: the `stone.openapi` bucket, every key optional.
 */
export interface OpenApiDecoratorOptions extends OpenApiConfig {}

/**
 * Class decorator: serve the API contract, declaratively.
 *
 * `@OpenApi()` is the whole setup. Two routes appear, `/openapi.json` and its explorer at `/docs`,
 * and the document is assembled per request so the server URL it advertises is the host that
 * answered: the same artefact documents itself correctly behind a local port, a load balancer or an
 * API Gateway stage. Set `docsPath: false` to serve the machine-readable contract alone.
 *
 * @param options - The OpenAPI configuration. Everything is optional.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { OpenApi } from '@stone-js/openapi'
 *
 * @OpenApi({ info: { title: 'Tasks', version: '1.0.0' } })
 * @StoneApp({ name: 'my-app' })
 * export class Application {}
 * ```
 */
export const OpenApi = <T extends ClassType = ClassType>(options: OpenApiDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // The blueprint is the single source of truth for what the module declares; the decorator only
    // overrides what it can, its options bucket. Cloning is what lets it: two decorated applications
    // get their own copy instead of sharing the exported constant.
    const blueprint = cloneValue(openApiBlueprint)

    blueprint.stone.openapi = { ...blueprint.stone.openapi, ...options }

    addBlueprint(target, context, blueprint)
  })
}
