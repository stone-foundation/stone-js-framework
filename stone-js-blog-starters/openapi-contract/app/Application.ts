import { Routing } from '@stone-js/router'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application
 *
 * The OpenAPI-contract app entry point. The router serves the API (TaskController) and the contract
 * (OpenApiController); the document is generated from the same schema the API validates with.
 */
@Routing()
@NodeConsole()
@NodeHttp({ default: true })
@StoneApp({ name: 'OpenApiContract', logger: { level: LogLevel.INFO } })
export class Application {}
