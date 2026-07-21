import { Routing } from '@stone-js/router'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application
 *
 * The stateless-auth app entry point.
 *
 * @Routing() enables the universal router; the auth blueprint (see configurations/AuthConfiguration)
 * adds the kernel middleware that verifies the Bearer token on every request. Guards then enforce
 * access per route. Nothing touches a session store, so the same code runs on Node, serverless and
 * the edge.
 */
@Routing()
@NodeConsole()
@NodeHttp({ default: true })
@StoneApp({ name: 'StatelessAuth', logger: { level: LogLevel.INFO } })
export class Application {}
