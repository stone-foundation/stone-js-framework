import { Auth } from '@stone-js/auth'
import { Routing } from '@stone-js/router'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application
 *
 * The stateless-auth app entry point.
 *
 * @Routing() enables the universal router; @Auth() adds the service provider and the kernel
 * middleware that verifies the Bearer token on every request. The signing strategy is configured
 * separately (see configurations/AuthConfiguration), and guards then enforce access per route.
 * Nothing touches a session store, so the same code runs on Node, serverless and the edge.
 */
@Auth()
@Routing()
@NodeConsole()
@NodeHttp({ default: true })
@StoneApp({ name: 'StatelessAuth', logger: { level: LogLevel.INFO } })
export class Application {}
