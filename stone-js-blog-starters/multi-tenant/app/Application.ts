import { Routing } from '@stone-js/router'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application
 *
 * The multi-tenant app entry point.
 *
 * @Routing() enables the universal router; a route's `domain` constraint is what makes the
 * tenant part of matching (see ./TenantController).
 * @NodeHttp() serves it over HTTP; the same domain runs unchanged on any other adapter.
 */
@Routing()
@NodeConsole()
@NodeHttp({ default: true })
@StoneApp({ name: 'MultiTenant', logger: { level: LogLevel.INFO } })
export class Application {}
