import { Routing } from '@stone-js/router'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, AdapterHookListenerContext, Hook, LogLevel } from '@stone-js/core'

/**
 * Application
 *
 * This is the main application entry point.
 *
 * @StoneApp() is used to enable the Stone application, it is required.
 * @Routing() is used to enable the routing feature.
 * @NodeHttp() is used to enable the Node HTTP adapter.
 *
 * Lifecycle hooks are used here just for demonstration purposes.
 */
@Routing()
@NodeHttp()
@StoneApp({ name: 'MyApp', logger: { level: LogLevel.INFO } })
export class Application {
  /**
   * Run before the application starts
   *
   * @param blueprint - The blueprint
   */
  @Hook('onStart')
  onStart ({ blueprint }: AdapterHookListenerContext): void {
    console.log(`${String(blueprint.get('stone.name', 'Stone App'))} is starting...`)
  }

  /**
   * Run just before the application stops
   *
   * @param blueprint - The blueprint
   */
  @Hook('onStop')
  onStop ({ blueprint }: AdapterHookListenerContext): void {
    console.log(`${String(blueprint.get('stone.name', 'Stone App'))} is stopping...`)
  }
}
