import { Routing } from '@stone-js/router'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application
 *
 * The validation app entry point.
 *
 * @Routing() enables the universal router; the validation lives on the route as middleware.
 * @NodeHttp() serves it over HTTP, where a failed schema becomes a 422 (see ValidationErrorHandler).
 */
@Routing()
@NodeConsole()
@NodeHttp({ default: true })
@StoneApp({ name: 'IsomorphicValidation', logger: { level: LogLevel.INFO } })
export class Application {}
