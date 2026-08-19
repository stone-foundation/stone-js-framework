import { OpenApiConfig, OpenApiBlueprint, openApiBlueprint } from '../options/OpenApiBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { MetaOpenApiRoutesMiddleware } from '../middleware/OpenApiRoutesMiddleware'

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
    // Rebuilt rather than referenced, so two decorated applications never share the same options
    // object or middleware array. It registers the very same middleware constant the blueprint
    // does, which is what keeps the two activation paths from drifting apart.
    const blueprint: OpenApiBlueprint = {
      stone: {
        ...openApiBlueprint.stone,
        openapi: { ...openApiBlueprint.stone.openapi, ...options },
        blueprint: { middleware: [MetaOpenApiRoutesMiddleware] }
      }
    }

    addBlueprint(target, context, blueprint)
  })
}
