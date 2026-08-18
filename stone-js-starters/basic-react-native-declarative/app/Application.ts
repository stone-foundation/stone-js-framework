import { Routing } from '@stone-js/router'
import { LogLevel, StoneApp } from '@stone-js/core'

/**
 * Application
 *
 * This is the main application entry point.
 *
 * @Routing() is used to enable the Stone router: incoming navigation events
 * are matched against the route definitions declared by the controllers.
 * @StoneApp() is used to enable the Stone application, it is required.
 */
@Routing()
@StoneApp({ name: 'Stone.js Native', logger: { level: LogLevel.INFO } })
export class Application {}
