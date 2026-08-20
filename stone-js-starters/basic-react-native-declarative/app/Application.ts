import { Routing } from '@stone-js/router'
import { LogLevel, StoneApp } from '@stone-js/core'
import { nativeAdapterBlueprint } from '../adapter/nativeAdapterBlueprint'

/**
 * Application
 *
 * This is the main application entry point.
 *
 * @Routing() enables the Stone router: incoming navigation events are matched
 * against the route definitions declared by the controllers.
 * @StoneApp() enables the Stone application (required). Extra blueprints are
 * activated through its second argument: here, the native adapter.
 */
@Routing()
@StoneApp({ name: 'Stone.js Native', logger: { level: LogLevel.INFO } }, [nativeAdapterBlueprint])
export class Application {}
