import { cloneValue } from '@stone-js/config'
import { HttpCorsConfig } from '../options/HttpConfig'
import { corsBlueprint } from '../options/CorsBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@Cors` decorator: the `stone.http.cors` bucket, every key optional.
 */
export interface CorsDecoratorOptions extends Partial<HttpCorsConfig> {}

/**
 * Class decorator: answer cross-origin requests, declaratively.
 *
 * `@Cors()` installs CORS on both dimensions at once: the kernel middleware that decorates every
 * response, and the adapter hook that still adds the headers when a request fails before the kernel
 * ever runs. Without one of the two, a browser reads an opaque network error instead of the status
 * you actually sent.
 *
 * Nothing is allowed by default: with no `origin`, no `Access-Control-Allow-Origin` header is
 * emitted at all, so an app that merely enables CORS stays same-origin. Name the origins you trust.
 *
 * @param options - The CORS configuration. Everything is optional.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { Cors } from '@stone-js/http-core'
 *
 * @Cors({ origin: ['https://app.example.com'], credentials: true })
 * @StoneApp({ name: 'my-app' })
 * export class Application {}
 * ```
 */
export const Cors = <T extends ClassType = ClassType>(options: CorsDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(corsBlueprint)

    blueprint.stone.http = { ...blueprint.stone.http, cors: { ...blueprint.stone.http?.cors, ...options } }

    addBlueprint(target, context, blueprint)
  })
}
